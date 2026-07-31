"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { EnterpriseInquiry } from "@/db";
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

export async function deleteEnterpriseInquiry(id: string): Promise<{ success: true } | { error: string }> {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  const deleted = await EnterpriseInquiry.destroy({ where: { id } });
  if (deleted === 0) return { error: "Not found." };

  revalidatePath("/admin/enterprise-inquiries");
  return { success: true };
}
