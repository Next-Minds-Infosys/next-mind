"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function toggleCoursePublished(
  id: string,
  published: boolean
): Promise<{ success: true } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  await prisma.course.update({ where: { id }, data: { published } });
  revalidatePath("/admin/courses");
  return { success: true };
}
