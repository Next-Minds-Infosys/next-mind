"use server";

import { revalidatePath } from "next/cache";
import { Enrollment } from "@/db";
import type { SubmissionStatus } from "@/lib/types";
import { RESOURCES } from "@/lib/policies";
import { sessionCan } from "@/lib/access";

export async function updateEnrollmentStatus(
  id: string,
  status: SubmissionStatus,
): Promise<{ success: true } | { error: string }> {
  const { allowed } = await sessionCan(RESOURCES.ENROLLMENTS, "update");
  if (!allowed) return { error: "Unauthorized" };

  await Enrollment.update({ status }, { where: { id } });
  revalidatePath("/admin/enrollments");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteEnrollment(id: string): Promise<{ success: true } | { error: string }> {
  const { allowed } = await sessionCan(RESOURCES.ENROLLMENTS, "delete");
  if (!allowed) return { error: "Unauthorized" };

  const deleted = await Enrollment.destroy({ where: { id } });
  if (deleted === 0) return { error: "Not found." };

  revalidatePath("/admin/enrollments");
  return { success: true };
}
