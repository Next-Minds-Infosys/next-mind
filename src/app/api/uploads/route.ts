import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { Batch, BatchStudent } from "@/db";
import { Role } from "@/lib/types";
import { buildKey, isStorageConfigured, presignUpload } from "@/lib/s3";
import { parseInput } from "@/lib/schemas";

const bodySchema = z.object({
  batchId: z.string().trim().min(1),
  filename: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(1).max(120),
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

  const { batchId, filename, contentType, scope } = parsed.data;
  const role = session.user.role as Role;

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
