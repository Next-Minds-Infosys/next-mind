import { NextRequest } from "next/server";
import { Op } from "sequelize";
import { getSession } from "@/lib/auth";
import { Assignment, Batch, BatchStudent, Course, Lesson, Material, Mentor, Post, Submission, User } from "@/db";
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
 * Course/mentor/post images and staff avatars are the exception - public
 * content, so they skip the session/batch check entirely.
 */
export async function GET(request: NextRequest, ctx: { params: Promise<{ key: string[] }> }) {
  if (!isStorageConfigured()) return new Response("Storage not configured", { status: 503 });

  const { key: segments } = await ctx.params;
  const key = segments.map(decodeURIComponent).join("/");

  const owner = await resolveOwner(key);
  if (!owner) return new Response("Not found", { status: 404 });

  if (!owner.public) {
    const session = await getSession();
    if (!session) return new Response("Unauthorized", { status: 401 });
    const allowed = await canAccess(
      owner.batchId,
      session.user.id,
      session.user.role as Role,
      owner.ownerUserId,
    );
    if (!allowed) return new Response("Forbidden", { status: 403 });
  }

  const url = owner.download
    ? await presignDownload(key, owner.fileName ?? "download")
    : await presignView(key);

  // 302 so the <video>/<img> element follows it. The Cache-Control is
  // load-bearing for private objects: without it a proxy or CDN could hold
  // the signed URL and hand it to someone who never passed the membership
  // check above. Public course images are safe to let a proxy/browser cache
  // briefly instead.
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      "Cache-Control": owner.public ? "public, max-age=300" : "private, no-store, max-age=0",
    },
  });
}

type Owner =
  | { public: true; download: false; fileName: null }
  | {
      public: false;
      batchId: string;
      download: boolean;
      fileName: string | null;
      ownerUserId: string | null;
    };

async function resolveOwner(key: string): Promise<Owner | null> {
  const lesson = await Lesson.findOne({ where: { videoKey: key }, attributes: ["batchId"] });
  if (lesson) {
    return {
      public: false,
      batchId: lesson.batchId,
      download: false,
      fileName: null,
      ownerUserId: null,
    };
  }

  const material = await Material.findOne({ where: { storageKey: key } });
  if (material) {
    return {
      public: false,
      batchId: material.batchId,
      download: material.downloadable,
      fileName: material.fileName,
      ownerUserId: null,
    };
  }

  const assignment = await Assignment.findOne({ where: { attachmentKey: key } });
  if (assignment) {
    return {
      public: false,
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
      public: false,
      batchId: submission.assignment.batchId,
      download: true,
      fileName: submission.fileName,
      // Narrows access to this one student: batch membership alone must not
      // expose a classmate's submitted work.
      ownerUserId: submission.userId,
    };
  }

  const course = await Course.findOne({ where: { imageUrl: key }, attributes: ["id"] });
  if (course) {
    return { public: true, download: false, fileName: null } as const;
  }

  const mentor = await Mentor.findOne({ where: { photo: key }, attributes: ["id"] });
  if (mentor) {
    return { public: true, download: false, fileName: null } as const;
  }

  // Staff profile photo - public like a mentor's, just self-managed.
  const avatarOwner = await User.findOne({ where: { image: key }, attributes: ["id"] });
  if (avatarOwner) {
    return { public: true, download: false, fileName: null } as const;
  }

  // Cover image, or an inline image embedded in the post body
  // (`![alt](/api/media/<key>)` written into contentMd by the editor's image
  // toolbar) - both are public once the post exists.
  const post = await Post.findOne({
    where: { [Op.or]: [{ coverKey: key }, { contentMd: { [Op.substring]: key } }] },
    attributes: ["id"],
  });
  if (post) {
    return { public: true, download: false, fileName: null } as const;
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
