"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import type { SubmissionStatus } from "@/lib/types";
import { ContactSubmission } from "@/db/models/contact-submission";

export async function updateContactStatus(
  id: string,
  status: SubmissionStatus
): Promise<{ success: true } | { error: string }> {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  await ContactSubmission.update({ status }, { where: { id } });
  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
  return { success: true };
}
