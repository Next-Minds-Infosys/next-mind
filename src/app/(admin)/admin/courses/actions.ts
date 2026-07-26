"use server";

import { revalidatePath } from "next/cache";
import { Op } from "sequelize";
import { getSession } from "@/lib/auth";
import { Course } from "@/db";
import { courseSchema, parseInput, type CourseInput } from "@/lib/schemas";
import { slugify } from "@/lib/utils";

export type { CourseInput };

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}



export async function createCourse(
  data: CourseInput
): Promise<{ success: true } | { error: string }> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized" };

  const parsed = parseInput(courseSchema, data);
  if (!parsed.success) return { error: parsed.error };
  data = parsed.data;

  const title = data.title.trim();
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 1;
  while (await Course.findOne({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  await Course.create({
    slug,
    title,
    categoryId: data.categoryId,
    description: data.description.trim(),
    shortDesc: data.shortDesc.trim() || null,
    contentMd: data.contentMd.trim(),
    tools: data.tools,
    whoIsItFor: data.whoIsItFor,
    skills: data.skills,
    curriculum: data.curriculum,
    faqs: data.faqs,
    badge: data.badge.trim() || null,
    color: data.color.trim() || null,
    students: data.students,
    duration: data.duration.trim(),
    level: data.level.trim(),
    price: data.price,
    imageUrl: data.imageUrl.trim() || null,
    published: data.published,
    createdById: session.user.id,
  });

  revalidatePath("/admin/courses");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateCourse(
  id: string,
  data: CourseInput
): Promise<{ success: true } | { error: string }> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const parsed = parseInput(courseSchema, data);
  if (!parsed.success) return { error: parsed.error };
  data = parsed.data;

  const course = await Course.findByPk(id);
  if (!course) return { error: "Course not found." };

  const title = data.title.trim();
  let slug = course.slug;
  if (title !== course.title) {
    const baseSlug = slugify(title);
    slug = baseSlug;
    let suffix = 1;
    while (await Course.findOne({ where: { slug, id: { [Op.ne]: id } } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }
  }

  await course.update({
    slug,
    title,
    categoryId: data.categoryId,
    description: data.description.trim(),
    shortDesc: data.shortDesc.trim() || null,
    contentMd: data.contentMd.trim(),
    tools: data.tools,
    whoIsItFor: data.whoIsItFor,
    skills: data.skills,
    curriculum: data.curriculum,
    faqs: data.faqs,
    badge: data.badge.trim() || null,
    color: data.color.trim() || null,
    students: data.students,
    duration: data.duration.trim(),
    level: data.level.trim(),
    price: data.price,
    imageUrl: data.imageUrl.trim() || null,
    published: data.published,
  });

  revalidatePath("/admin/courses");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteCourse(id: string): Promise<{ success: true } | { error: string }> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  await Course.destroy({ where: { id } });
  revalidatePath("/admin/courses");
  revalidatePath("/admin");
  return { success: true };
}

export async function toggleCoursePublished(
  id: string,
  published: boolean
): Promise<{ success: true } | { error: string }> {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  await Course.update({ published }, { where: { id } });
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function updateCourseCategory(
  id: string,
  categoryId: string
): Promise<{ success: true } | { error: string }> {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  await Course.update({ categoryId }, { where: { id } });
  revalidatePath("/admin/courses");
  revalidatePath("/admin/categories");
  return { success: true };
}
