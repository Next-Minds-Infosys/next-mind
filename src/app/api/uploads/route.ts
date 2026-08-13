import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { Batch, BatchStudent } from "@/db";
import { Role } from "@/lib/types";
import { buildKey, isStorageConfigured, presignUpload } from "@/lib/s3";
import { parseInput } from "@/lib/schemas";

/** Staff roles allowed to upload their own profile photo. See "avatar" scope below. */
const STAFF_ROLES = new Set<string>([Role.ADMIN, Role.EDITOR, Role.INSTRUCTOR]);

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
  courseImage: /^image\/(png|jpeg|webp)$/,
  mentorPhoto: /^image\/(png|jpeg|webp)$/,
  postCover: /^image\/(png|jpeg|webp)$/,
  postImage: /^image\/(png|jpeg|webp)$/,
  avatar: /^image\/(png|jpeg|webp)$/,
};

/** 2 GB for a recording, 25 MB for documents, 8 MB for a course cover image or mentor photo. */
const MAX_BYTES: Record<string, number> = {
  lesson: 2 * 1024 * 1024 * 1024,
  material: 25 * 1024 * 1024,
  assignment: 25 * 1024 * 1024,
  submission: 25 * 1024 * 1024,
  courseImage: 8 * 1024 * 1024,
  mentorPhoto: 8 * 1024 * 1024,
  postCover: 8 * 1024 * 1024,
  postImage: 8 * 1024 * 1024,
  avatar: 5 * 1024 * 1024,
};

/**
 * S3 key prefix per scope. Batch-scoped uploads use the scope name itself
 * (`lesson/<batchId>/...`); "courseImage"/"mentorPhoto"/"avatar" aren't
 * batch-scoped, so they share a fixed folder instead - all are teacher-side
 * public content (a course's cover, a mentor's own photo, a staff member's
 * own avatar), not per-batch content. `publicMediaSrc` in
 * src/lib/media-image.ts only recognises this exact prefix.
 */
const KEY_PREFIX: Record<string, string> = {
  courseImage: "videos/teacher",
  mentorPhoto: "videos/teacher",
  postCover: "videos/teacher",
  postImage: "videos/teacher",
  avatar: "videos/teacher",
};

/** Scopes that are admin-only and not tied to a batch. */
const ADMIN_ONLY_SCOPES = new Set(["courseImage", "mentorPhoto", "postCover", "postImage"]);

const bodySchema = z.object({
  // Batch id for batch-scoped uploads, the course/mentor id (or a
  // client-generated draft id while a new row hasn't been saved yet) for the
  // admin-only scopes, or the caller's own user id for "avatar".
  resourceId: z.string().trim().min(1),
  filename: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(1).max(120),
  /** Optional so existing callers keep working; enforced when supplied. */
  sizeBytes: z.coerce.number().int().positive().optional(),
  // "lesson"/"material"/"assignment" are instructor-only; "submission" is a
  // student; "courseImage"/"mentorPhoto"/"postCover"/"postImage" are
  // admin-only; "avatar" is any staff member uploading their own profile photo.
  scope: z.enum([
    "lesson",
    "material",
    "assignment",
    "submission",
    "courseImage",
    "mentorPhoto",
    "postCover",
    "postImage",
    "avatar",
  ]),
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

  const { resourceId, filename, contentType, sizeBytes, scope } = parsed.data;
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

  // Authorise before handing out a writable URL.
  if (scope === "submission") {
    const member = await BatchStudent.findOne({
      where: { batchId: resourceId, userId: session.user.id, status: "ACTIVE" },
    });
    if (!member) return Response.json({ error: "Forbidden" }, { status: 403 });
  } else if (scope === "avatar") {
    // A profile photo has no owning row to check against - the caller may
    // only ever mint a key under their own user id, and only staff have a
    // profile page that offers this.
    if (resourceId !== session.user.id || !STAFF_ROLES.has(role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (ADMIN_ONLY_SCOPES.has(scope)) {
    if (role !== Role.ADMIN) return Response.json({ error: "Forbidden" }, { status: 403 });
  } else {
    const owns =
      role === Role.ADMIN ||
      (await Batch.findOne({ where: { id: resourceId, instructorId: session.user.id } }));
    if (!owns) return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const key = buildKey(KEY_PREFIX[scope] ?? scope, resourceId, filename);
  const url = await presignUpload(key, contentType);
  return Response.json({ url, key });
}
