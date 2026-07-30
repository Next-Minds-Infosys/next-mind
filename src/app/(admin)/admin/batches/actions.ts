"use server";

import { revalidatePath } from "next/cache";
import { Assignment, Batch, BatchStudent, Invoice, Lesson, Material, Message, User } from "@/db";
import { getSession } from "@/lib/auth";
import { Role } from "@/lib/types";
import { batchSchema, createUserSchema, parseInput } from "@/lib/schemas";
import { createUser } from "../users/actions";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== Role.ADMIN) return null;
  return session;
}

export async function createBatch(data: unknown): Promise<{ success: true } | { error: string }> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

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
  if (!(await requireAdmin())) return { error: "Unauthorized" };

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
  if (!(await requireAdmin())) return { error: "Unauthorized" };
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
  if (!(await requireAdmin())) return { error: "Unauthorized" };
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
  if (!(await requireAdmin())) return { error: "Unauthorized" };

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
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  await BatchStudent.update({ status: "DROPPED" }, { where: { id: membershipId } });
  revalidatePath(`/admin/batches/${batchId}`);
  return { success: true };
}

export type EnrolResult =
  | { success: true; created: false }
  /** A new account was made; the password is surfaced exactly as in createUser. */
  | { success: true; created: true; email: string; password?: string; emailed?: boolean }
  | { error: string };

/**
 * Enrol in one step, creating the account first if the email is unknown.
 *
 * Previously an admin had to go to Users, create the person, come back to the
 * batch and retype the address. Account creation is delegated to createUser so
 * the one-time-password rules (hashing, mustChangePassword, single delivery
 * channel) stay in exactly one place.
 */
export async function enrolStudent(
  batchId: string,
  data: unknown,
): Promise<EnrolResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const parsed = parseInput(createUserSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const { email } = parsed.data;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const added = await addStudentToBatch(batchId, email);
    if ("error" in added) return { error: added.error };
    return { success: true, created: false };
  }

  const made = await createUser({ ...parsed.data, role: "STUDENT" });
  if ("error" in made) return { error: made.error };

  const added = await addStudentToBatch(batchId, email);
  if ("error" in added) {
    // The account exists now even though enrolment failed - say so, rather than
    // letting the admin think nothing happened and create a duplicate.
    return { error: `Account created, but enrolment failed: ${added.error}` };
  }

  revalidatePath(`/admin/batches/${batchId}`);
  return {
    success: true,
    created: true,
    email,
    password: "password" in made ? made.password : undefined,
    emailed: "emailed" in made ? made.emailed : undefined,
  };
}
