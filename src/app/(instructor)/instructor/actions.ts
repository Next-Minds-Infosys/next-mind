"use server";

import { revalidatePath } from "next/cache";
import { Assignment, Batch, Lesson, Material, Message, Submission } from "@/db";
import { getSession } from "@/lib/auth";
import { keyBelongsToBatch } from "@/lib/s3";
import { Role } from "@/lib/types";
import {
  assignmentSchema,
  gradeSchema,
  lessonSchema,
  materialSchema,
  messageSchema,
  parseInput,
} from "@/lib/schemas";

type ActionResult = { success: true } | { error: string };

/**
 * Every action re-derives ownership from the session. A batchId in the payload
 * is untrusted, so it is only used after this returns.
 */
async function ownedBatch(batchId: string) {
  const session = await getSession();
  if (!session) return null;
  const role = session.user.role as Role;
  const where =
    role === Role.ADMIN ? { id: batchId } : { id: batchId, instructorId: session.user.id };
  const batch = await Batch.findOne({ where });
  return batch ? { batch, session } : null;
}

/** A reply may only attach to a thread inside the same batch. */
async function parentInBatch(parentId: string | undefined, batchId: string) {
  if (!parentId) return true;
  return Boolean(await Message.findOne({ where: { id: parentId, batchId } }));
}

export async function createLesson(batchId: string, data: unknown): Promise<ActionResult> {
  const ctx = await ownedBatch(batchId);
  if (!ctx) return { error: "Forbidden" };
  const parsed = parseInput(lessonSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const d = parsed.data;
  if (d.videoKey && !keyBelongsToBatch(d.videoKey, "lesson", batchId)) {
    return { error: "That file does not belong to this batch." };
  }

  await Lesson.create({
    batchId,
    title: d.title,
    description: d.description || null,
    orderIndex: d.orderIndex,
    videoKey: d.videoKey || null,
    videoMime: d.videoMime || null,
    videoSizeBytes: d.videoSizeBytes ?? null,
    published: d.published,
    createdById: ctx.session.user.id,
  });
  revalidatePath(`/instructor/batches/${batchId}`);
  return { success: true };
}

export async function deleteLesson(batchId: string, lessonId: string): Promise<ActionResult> {
  const ctx = await ownedBatch(batchId);
  if (!ctx) return { error: "Forbidden" };
  await Lesson.destroy({ where: { id: lessonId, batchId } });
  revalidatePath(`/instructor/batches/${batchId}`);
  return { success: true };
}

export async function createMaterial(batchId: string, data: unknown): Promise<ActionResult> {
  const ctx = await ownedBatch(batchId);
  if (!ctx) return { error: "Forbidden" };
  const parsed = parseInput(materialSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const d = parsed.data;
  if (!keyBelongsToBatch(d.storageKey, "material", batchId)) {
    return { error: "That file does not belong to this batch." };
  }

  await Material.create({
    batchId,
    lessonId: d.lessonId || null,
    title: d.title,
    storageKey: d.storageKey,
    fileName: d.fileName,
    mimeType: d.mimeType || null,
    sizeBytes: d.sizeBytes ?? null,
    downloadable: d.downloadable,
    createdById: ctx.session.user.id,
  });
  revalidatePath(`/instructor/batches/${batchId}`);
  return { success: true };
}

export async function createAssignment(batchId: string, data: unknown): Promise<ActionResult> {
  const ctx = await ownedBatch(batchId);
  if (!ctx) return { error: "Forbidden" };
  const parsed = parseInput(assignmentSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const d = parsed.data;
  if (d.attachmentKey && !keyBelongsToBatch(d.attachmentKey, "assignment", batchId)) {
    return { error: "That file does not belong to this batch." };
  }

  await Assignment.create({
    batchId,
    title: d.title,
    briefMd: d.briefMd,
    attachmentKey: d.attachmentKey || null,
    attachmentName: d.attachmentName || null,
    dueAt: d.dueAt ? new Date(d.dueAt) : null,
    maxScore: d.maxScore,
    published: d.published,
    createdById: ctx.session.user.id,
  });
  revalidatePath(`/instructor/batches/${batchId}`);
  return { success: true };
}

export async function gradeSubmission(batchId: string, data: unknown): Promise<ActionResult> {
  const ctx = await ownedBatch(batchId);
  if (!ctx) return { error: "Forbidden" };
  const parsed = parseInput(gradeSchema, data);
  if (!parsed.success) return { error: parsed.error };

  const submission = await Submission.findByPk(parsed.data.submissionId, {
    include: [{ model: Assignment, as: "assignment", attributes: ["batchId", "maxScore"] }],
  });
  // Confirm the submission really belongs to this batch before writing.
  if (!submission || submission.assignment?.batchId !== batchId) {
    return { error: "Submission not found." };
  }
  if (parsed.data.score > (submission.assignment?.maxScore ?? 100)) {
    return { error: "Score exceeds the assignment maximum." };
  }

  await submission.update({
    score: parsed.data.score,
    feedback: parsed.data.feedback || null,
    gradedById: ctx.session.user.id,
    gradedAt: new Date(),
  });
  revalidatePath(`/instructor/batches/${batchId}`);
  return { success: true };
}

export async function postMessage(data: unknown): Promise<ActionResult> {
  const parsed = parseInput(messageSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const ctx = await ownedBatch(parsed.data.batchId);
  if (!ctx) return { error: "Forbidden" };
  if (!(await parentInBatch(parsed.data.parentId, parsed.data.batchId))) {
    return { error: "That thread does not belong to this batch." };
  }

  await Message.create({
    batchId: parsed.data.batchId,
    authorId: ctx.session.user.id,
    body: parsed.data.body,
    parentId: parsed.data.parentId || null,
  });
  revalidatePath(`/instructor/batches/${parsed.data.batchId}`);
  return { success: true };
}
