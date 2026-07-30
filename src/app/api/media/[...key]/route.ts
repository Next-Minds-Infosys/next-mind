import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { Assignment, Batch, BatchStudent, Lesson, Material, Submission } from "@/db";
import { Role } from "@/lib/types";
import { isStorageConfigured, presignDownload, presignView } from "@/lib/s3";

/**
 * The only way a file leaves S3.
 *
 * Resolves an object key back to the row that owns it, checks the caller
 * belongs to that batch, then redirects to a short-lived presigned URL. The
 * bucket itself is private, so a key alone is worthless without this check.
 *
 * Video is served inline (watch-only); documents get a download disposition.
 */
export async function GET(request: NextRequest, ctx: { params: Promise<{ key: string[] }> }) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  if (!isStorageConfigured()) return new Response("Storage not configured", { status: 503 });

  const { key: segments } = await ctx.params;
  const key = segments.map(decodeURIComponent).join("/");

  const owner = await resolveOwner(key);
  if (!owner) return new Response("Not found", { status: 404 });

  const allowed = await canAccess(
    owner.batchId,
    session.user.id,
    session.user.role as Role,
    owner.ownerUserId,
  );
  if (!allowed) return new Response("Forbidden", { status: 403 });

  const url = owner.download
    ? await presignDownload(key, owner.fileName ?? "download")
    : await presignView(key);

  // 302 so the <video> element follows it; never cache the signed URL.
  return Response.redirect(url, 302);
}

async function resolveOwner(key: string) {
  const lesson = await Lesson.findOne({ where: { videoKey: key }, attributes: ["batchId"] });
  if (lesson) {
    return { batchId: lesson.batchId, download: false, fileName: null, ownerUserId: null };
  }

  const material = await Material.findOne({ where: { storageKey: key } });
  if (material) {
    return {
      batchId: material.batchId,
      download: material.downloadable,
      fileName: material.fileName,
      ownerUserId: null,
    };
  }

  const assignment = await Assignment.findOne({ where: { attachmentKey: key } });
  if (assignment) {
    return {
      batchId: assignment.batchId,
      download: true,
      fileName: assignment.attachmentName,
      ownerUserId: null,
    };
  }

  const submission = await Submission.findOne({
    where: { storageKey: key },
    include: [{ model: Assignment, as: "assignment", attributes: ["batchId"] }],
  });
  if (submission?.assignment) {
    return {
      batchId: submission.assignment.batchId,
      download: true,
      fileName: submission.fileName,
      // Narrows access to this one student: batch membership alone must not
      // expose a classmate's submitted work.
      ownerUserId: submission.userId,
    };
  }
  return null;
}

/**
 * `ownerUserId` marks an object that belongs to one person rather than to the
 * whole batch (a submission). Staff still see it - an instructor has to grade
 * it - but a peer in the same batch must not.
 */
async function canAccess(
  batchId: string,
  userId: string,
  role: Role,
  ownerUserId: string | null,
) {
  if (role === Role.ADMIN) return true;
  if (await Batch.findOne({ where: { id: batchId, instructorId: userId } })) return true;
  if (ownerUserId !== null) return ownerUserId === userId;
  return Boolean(
    await BatchStudent.findOne({ where: { batchId, userId, status: "ACTIVE" } }),
  );
}
