"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { EnterpriseInquiry } from "@/db/models";
import type { SubmissionStatus } from "@/lib/types";

export async function updateEnterpriseInquiryStatus(
  id: string,
  status: SubmissionStatus,
): Promise<{ success: true } | { error: string }> {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  await EnterpriseInquiry.update({ status }, { where: { id } });
  revalidatePath("/admin/enterprise-inquiries");
  revalidatePath("/admin");
  return { success: true };
}
