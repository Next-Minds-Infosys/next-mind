"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { EnterpriseInquiry } from "@/db/models";
import type { SubmissionStatus } from "@/lib/types";

export async function updateEnterpriseInquiryStatus(
  id: string,
  status: SubmissionStatus
): Promise<{ success: true } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  await EnterpriseInquiry.update({ status }, { where: { id } });
  revalidatePath("/admin/enterprise-inquiries");
  revalidatePath("/admin");
  return { success: true };
}
