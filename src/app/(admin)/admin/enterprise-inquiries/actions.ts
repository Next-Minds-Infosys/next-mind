"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SubmissionStatus } from "@/generated/prisma/client";

export async function updateEnterpriseInquiryStatus(
  id: string,
  status: SubmissionStatus
): Promise<{ success: true } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  await prisma.enterpriseInquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin/enterprise-inquiries");
  return { success: true };
}
