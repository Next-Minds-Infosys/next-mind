import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { Batch, BatchStudent } from "@/db";
import { Role } from "@/lib/types";
import { buildKey, isStorageConfigured, presignUpload } from "@/lib/s3";
import { parseInput } from "@/lib/schemas";

/**
 * What each scope is allowed to put in the bucket.
 *
 * The presigned PUT is signed with whatever contentType the client asks for, so
 * without an allowlist a student could upload an .html file as a "submission"
 * and get a same-origin-ish URL back from /api/media - a stored-XSS vector via
 * your own storage. Video is only accepted for lessons.
 */
const ALLOWED: Record<string, RegExp> = {
  lesson: /^video\/(mp4|webm|quicktime|x-matroska)$/,
  material: /^(application\/(pdf|zip|vnd\.openxmlformats-officedocument\.[\w.-]+|vnd\.ms-\w+|msword)|image\/(png|jpeg|webp|gif)|text\/plain)$/,
  assignment: /^(application\/(pdf|zip|vnd\.openxmlformats-officedocument\.[\w.-]+|msword)|image\/(png|jpeg|webp)|text\/plain)$/,
  submission: /^(application\/(pdf|zip|vnd\.openxmlformats-officedocument\.[\w.-]+|msword)|image\/(png|jpeg|webp)|text\/plain)$/,
};

/** 2 GB for a recording, 25 MB for anything else. */
const MAX_BYTES: Record<string, number> = {
  lesson: 2 * 1024 * 1024 * 1024,
  material: 25 * 1024 * 1024,
  assignment: 25 * 1024 * 1024,
  submission: 25 * 1024 * 1024,
};

const bodySchema = z.object({
  batchId: z.string().trim().min(1),
  filename: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(1).max(120),
  /** Optional so existing callers keep working; enforced when supplied. */
  sizeBytes: z.coerce.number().int().positive().optional(),
  // "lesson"/"material"/"assignment" are instructor-only; "submission" is a student.
  scope: z.enum(["lesson", "material", "assignment", "submission"]),
});

/**
 * Mints a presigned PUT so the browser uploads straight to S3.
 *
 * The key is generated here, never accepted from the client - otherwise a
 * caller could overwrite another batch's objects by choosing the path.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!isStorageConfigured()) {
    return Response.json({ error: "File storage is not configured." }, { status: 503 });
  }

  const parsed = parseInput(bodySchema, await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const { batchId, filename, contentType, sizeBytes, scope } = parsed.data;
  const role = session.user.role as Role;

  if (!ALLOWED[scope].test(contentType)) {
    return Response.json(
      { error: `That file type is not allowed for ${scope} uploads.` },
      { status: 415 },
    );
  }
  if (sizeBytes !== undefined && sizeBytes > MAX_BYTES[scope]) {
    return Response.json(
      { error: `File is too large. The limit is ${Math.round(MAX_BYTES[scope] / 1024 / 1024)} MB.` },
      { status: 413 },
    );
  }

  // Authorise against the batch before handing out a writable URL.
  if (scope === "submission") {
    const member = await BatchStudent.findOne({
      where: { batchId, userId: session.user.id, status: "ACTIVE" },
    });
    if (!member) return Response.json({ error: "Forbidden" }, { status: 403 });
  } else {
    const owns =
      role === Role.ADMIN ||
      (await Batch.findOne({ where: { id: batchId, instructorId: session.user.id } }));
    if (!owns) return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const key = buildKey(scope, batchId, filename);
  const url = await presignUpload(key, contentType);
  return Response.json({ url, key });
}
