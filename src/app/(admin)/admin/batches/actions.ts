"use server";

import { revalidatePath } from "next/cache";
import { Assignment, Batch, BatchStudent, Invoice, Lesson, Material, Message, User } from "@/db";
import { Role } from "@/lib/types";
import { batchSchema, parseInput } from "@/lib/schemas";
import { RESOURCES, type Action } from "@/lib/policies";
import { sessionCan } from "@/lib/access";

async function requireBatches(action: Action) {
  const { allowed } = await sessionCan(RESOURCES.BATCHES, action);
  return allowed;
}

export async function createBatch(data: unknown): Promise<{ success: true } | { error: string }> {
  if (!(await requireBatches("create"))) return { error: "Unauthorized" };

  const parsed = parseInput(batchSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const d = parsed.data;

  if (await Batch.findOne({ where: { code: d.code } })) {
    return { error: "That batch code is already in use." };
  }

  await Batch.create({
    courseId: d.courseId,
    instructorId: d.instructorId || null,
    name: d.name,
    code: d.code,
    startDate: d.startDate || null,
    endDate: d.endDate || null,
    schedule: d.schedule || null,
    mode: d.mode,
    capacity: d.capacity,
    status: d.status,
  });

  revalidatePath("/admin/batches");
  return { success: true };
}

export async function updateBatch(
  id: string,
  data: unknown,
): Promise<{ success: true } | { error: string }> {
  if (!(await requireBatches("update"))) return { error: "Unauthorized" };

  const parsed = parseInput(batchSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const d = parsed.data;

  const batch = await Batch.findByPk(id);
  if (!batch) return { error: "Batch not found." };

  const clash = await Batch.findOne({ where: { code: d.code } });
  if (clash && clash.id !== id) return { error: "That batch code is already in use." };

  await batch.update({
    courseId: d.courseId,
    instructorId: d.instructorId || null,
    name: d.name,
    code: d.code,
    startDate: d.startDate || null,
    endDate: d.endDate || null,
    schedule: d.schedule || null,
    mode: d.mode,
    capacity: d.capacity,
    status: d.status,
  });

  revalidatePath("/admin/batches");
  revalidatePath(`/admin/batches/${id}`);
  return { success: true };
}

export interface BatchImpact {
  students: number;
  lessons: number;
  materials: number;
  assignments: number;
  messages: number;
  invoices: number;
}

/**
 * What deleting this batch would destroy.
 *
 * Lesson/Material/Assignment/Message/BatchStudent all cascade from Batch, so a
 * delete silently takes the whole batch's teaching content with it. The UI
 * shows these numbers before asking for confirmation. Invoices are ON DELETE
 * SET NULL, so they survive but lose the batch link - counted separately.
 */
export async function batchImpact(id: string): Promise<BatchImpact | { error: string }> {
  if (!(await requireBatches("delete"))) return { error: "Unauthorized" };
  const [students, lessons, materials, assignments, messages, invoices] = await Promise.all([
    BatchStudent.count({ where: { batchId: id } }),
    Lesson.count({ where: { batchId: id } }),
    Material.count({ where: { batchId: id } }),
    Assignment.count({ where: { batchId: id } }),
    Message.count({ where: { batchId: id } }),
    Invoice.count({ where: { batchId: id } }),
  ]);
  return { students, lessons, materials, assignments, messages, invoices };
}

export async function deleteBatch(id: string): Promise<{ success: true } | { error: string }> {
  if (!(await requireBatches("delete"))) return { error: "Unauthorized" };
  const batch = await Batch.findByPk(id);
  if (!batch) return { error: "Batch not found." };
  await batch.destroy();
  revalidatePath("/admin/batches");
  return { success: true };
}

export async function addStudentToBatch(
  batchId: string,
  email: string,
): Promise<{ success: true } | { error: string }> {
  if (!(await requireBatches("update"))) return { error: "Unauthorized" };

  const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
  if (!user) return { error: "No user with that email. Create them under Users first." };

  const existing = await BatchStudent.findOne({ where: { batchId, userId: user.id } });
  if (existing) {
    if (existing.status === "ACTIVE") return { error: "Already in this batch." };
    await existing.update({ status: "ACTIVE" }); // re-activate a dropped student
    revalidatePath(`/admin/batches/${batchId}`);
    return { success: true };
  }

  const batch = await Batch.findByPk(batchId);
  if (!batch) return { error: "Batch not found." };
  if (batch.capacity > 0) {
    const count = await BatchStudent.count({ where: { batchId, status: "ACTIVE" } });
    if (count >= batch.capacity) return { error: "This batch is full." };
  }

  await BatchStudent.create({ batchId, userId: user.id, enrolledAt: new Date() });
  revalidatePath(`/admin/batches/${batchId}`);
  return { success: true };
}

export async function removeStudentFromBatch(
  membershipId: string,
  batchId: string,
): Promise<{ success: true } | { error: string }> {
  if (!(await requireBatches("update"))) return { error: "Unauthorized" };
  await BatchStudent.update({ status: "DROPPED" }, { where: { id: membershipId } });
  revalidatePath(`/admin/batches/${batchId}`);
  return { success: true };
}

export async function addStudentById(
  batchId: string,
  userId: string,
): Promise<{ success: true } | { error: string }> {
  if (!(await requireBatches("update"))) return { error: "Unauthorized" };
  if (!userId) return { error: "Select a student first." };

  const user = await User.findByPk(userId, { attributes: ["id", "email", "role"] });
  if (!user) return { error: "That user no longer exists." };
  if (user.role !== Role.STUDENT) {
    return { error: "Only student accounts can join a roster. Assign staff as the batch teacher." };
  }

  // Reuse the existing path so the capacity and re-activation rules stay in one
  // place rather than being duplicated here.
  const added = await addStudentToBatch(batchId, user.email);
  if ("error" in added) return added;

  revalidatePath(`/admin/batches/${batchId}`);
  return { success: true };
}

/**
 * Sets (or clears) the batch instructor on its own.
 *
 * Assigning a teacher previously meant opening the whole batch form and saving
 * every field, which is both easy to miss and easy to get wrong. Only
 * INSTRUCTOR or ADMIN accounts are accepted - a student cannot be made to teach.
 */
export async function assignInstructor(
  batchId: string,
  instructorId: string,
): Promise<{ success: true } | { error: string }> {
  if (!(await requireBatches("update"))) return { error: "Unauthorized" };

  const batch = await Batch.findByPk(batchId);
  if (!batch) return { error: "Batch not found." };

  if (instructorId) {
    const user = await User.findByPk(instructorId, { attributes: ["id", "role"] });
    if (!user) return { error: "That user no longer exists." };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      return { error: "Only instructors or admins can be assigned to a batch." };
    }
  }

  await batch.update({ instructorId: instructorId || null });
  revalidatePath(`/admin/batches/${batchId}`);
  revalidatePath("/admin/batches");
  return { success: true };
}
