"use server";

import { revalidatePath } from "next/cache";
import { Assignment, BatchStudent, Lesson, LessonProgress, Message, Submission } from "@/db";
import { getSession } from "@/lib/auth";
import { keyBelongsToBatch } from "@/lib/s3";
import { messageSchema, parseInput, submissionSchema } from "@/lib/schemas";

type ActionResult = { success: true } | { error: string };

/** Confirms the caller is an ACTIVE member before any write touches the batch. */
async function membership(batchId: string) {
  const session = await getSession();
  if (!session) return null;
  const member = await BatchStudent.findOne({
    where: { batchId, userId: session.user.id, status: "ACTIVE" },
  });
  return member ? session : null;
}

export async function submitAssignment(data: unknown): Promise<ActionResult> {
  const parsed = parseInput(submissionSchema, data);
  if (!parsed.success) return { error: parsed.error };

  const assignment = await Assignment.findByPk(parsed.data.assignmentId);
  if (!assignment) return { error: "Assignment not found." };

  const session = await membership(assignment.batchId);
  if (!session) return { error: "Forbidden" };

  // A draft assignment is not visible to students, so it is not submittable.
  if (!assignment.published) return { error: "Assignment not found." };

  if (
    parsed.data.storageKey &&
    !keyBelongsToBatch(parsed.data.storageKey, "submission", assignment.batchId)
  ) {
    return { error: "That file does not belong to this batch." };
  }

  // Late submissions are refused server-side; hiding the button is not enough.
  if (assignment.dueAt && assignment.dueAt.getTime() < Date.now()) {
    return { error: "The deadline for this assignment has passed." };
  }

  const existing = await Submission.findOne({
    where: { assignmentId: assignment.id, userId: session.user.id },
  });

  const payload = {
    storageKey: parsed.data.storageKey || null,
    fileName: parsed.data.fileName || null,
    note: parsed.data.note || null,
    submittedAt: new Date(),
  };

  if (existing) {
    if (existing.gradedAt) return { error: "This has already been graded and cannot be changed." };
    await existing.update(payload); // resubmission replaces the previous attempt
  } else {
    await Submission.create({
      assignmentId: assignment.id,
      userId: session.user.id,
      ...payload,
    });
  }

  revalidatePath(`/student/batches/${assignment.batchId}`);
  return { success: true };
}

export async function replyToMessage(data: unknown): Promise<ActionResult> {
  const parsed = parseInput(messageSchema, data);
  if (!parsed.success) return { error: parsed.error };

  const session = await membership(parsed.data.batchId);
  if (!session) return { error: "Forbidden" };
  if (
    parsed.data.parentId &&
    !(await Message.findOne({ where: { id: parsed.data.parentId, batchId: parsed.data.batchId } }))
  ) {
    return { error: "That thread does not belong to this batch." };
  }

  await Message.create({
    batchId: parsed.data.batchId,
    authorId: session.user.id,
    body: parsed.data.body,
    parentId: parsed.data.parentId || null,
  });

  revalidatePath(`/student/batches/${parsed.data.batchId}`);
  return { success: true };
}

/**
 * Marks a lesson done, or clears it. Membership is re-derived from the lesson's
 * own batch, so a lessonId from the client cannot reach a batch the caller is
 * not in. The unique (lessonId, userId) pair makes this idempotent.
 */
export async function setLessonComplete(
  lessonId: string,
  done: boolean,
): Promise<ActionResult> {
  const lesson = await Lesson.findByPk(lessonId, { attributes: ["id", "batchId", "published"] });
  if (!lesson || !lesson.published) return { error: "Lesson not found." };

  const session = await membership(lesson.batchId);
  if (!session) return { error: "Forbidden" };

  if (done) {
    const existing = await LessonProgress.findOne({ where: { lessonId, userId: session.user.id } });
    if (!existing) {
      await LessonProgress.create({ lessonId, userId: session.user.id, completedAt: new Date() });
    }
  } else {
    await LessonProgress.destroy({ where: { lessonId, userId: session.user.id } });
  }

  revalidatePath(`/student/batches/${lesson.batchId}`);
  revalidatePath("/student");
  return { success: true };
}
