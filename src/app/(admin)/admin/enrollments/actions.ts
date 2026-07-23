"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { Enrollment } from "@/db";
import type { SubmissionStatus } from "@/lib/types";

export async function updateEnrollmentStatus(
  id: string,
  status: SubmissionStatus
): Promise<{ success: true } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  await Enrollment.update({ status }, { where: { id } });
  revalidatePath("/admin/enrollments");
  revalidatePath("/admin");
  return { success: true };
}
