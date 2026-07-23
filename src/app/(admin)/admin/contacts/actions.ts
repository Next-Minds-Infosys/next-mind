"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import type { SubmissionStatus } from "@/lib/types";
import { ContactSubmission } from "@/db/models/contact-submission";

export async function updateContactStatus(
  id: string,
  status: SubmissionStatus
): Promise<{ success: true } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  await ContactSubmission.update({ status }, { where: { id } });
  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
  return { success: true };
}
