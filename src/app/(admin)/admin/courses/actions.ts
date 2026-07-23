"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { Course } from "@/db";

export async function toggleCoursePublished(
  id: string,
  published: boolean
): Promise<{ success: true } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  await Course.update({ published }, { where: { id } });
  revalidatePath("/admin/courses");
  return { success: true };
}
