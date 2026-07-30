"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import type { SubmissionStatus } from "@/lib/types";
import { ContactSubmission } from "@/db";

export async function updateContactStatus(
  id: string,
  status: SubmissionStatus,
): Promise<{ success: true } | { error: string }> {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  await ContactSubmission.update({ status }, { where: { id } });
  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteContact(id: string): Promise<{ success: true } | { error: string }> {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  const deleted = await ContactSubmission.destroy({ where: { id } });
  if (deleted === 0) return { error: "Not found." };

  revalidatePath("/admin/contacts");
  return { success: true };
}
