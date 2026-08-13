"use server";

import { revalidatePath } from "next/cache";
import { revalidatePublicCourses } from "@/lib/revalidate";
import { Category, Course } from "@/db";
import { categorySchema, parseInput, type CategoryInput } from "@/lib/schemas";
import { slugify } from "@/lib/utils";
import { RESOURCES, type Action } from "@/lib/policies";
import { sessionCan } from "@/lib/access";

export type { CategoryInput };

async function requireCategories(action: Action) {
  const { allowed } = await sessionCan(RESOURCES.CATEGORIES, action);
  return allowed;
}

export async function createCategory(
  data: CategoryInput,
): Promise<{ success: true } | { error: string }> {
  if (!(await requireCategories("create"))) return { error: "Unauthorized" };

  const parsed = parseInput(categorySchema, data);
  if (!parsed.success) return { error: parsed.error };
  data = parsed.data;

  const name = data.name;

  const slug = slugify(name);
  const existing = await Category.findOne({ where: { name } });
  if (existing) return { error: "A category with that name already exists." };

  await Category.create({
    name,
    slug,
    description: data.description.trim() || null,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/courses");
  revalidatePath("/admin");
  revalidatePublicCourses();
  return { success: true };
}

export async function updateCategory(
  id: string,
  data: CategoryInput,
): Promise<{ success: true } | { error: string }> {
  if (!(await requireCategories("update"))) return { error: "Unauthorized" };

  const parsed = parseInput(categorySchema, data);
  if (!parsed.success) return { error: parsed.error };
  data = parsed.data;

  const name = data.name;

  const existing = await Category.findOne({ where: { name } });
  if (existing && existing.id !== id) {
    return { error: "A category with that name already exists." };
  }

  const category = await Category.findByPk(id);
  if (!category) return { error: "Category not found." };

  await category.update({
    name,
    slug: slugify(name),
    description: data.description.trim() || null,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/courses");
  revalidatePublicCourses();
  return { success: true };
}

export async function deleteCategory(id: string): Promise<{ success: true } | { error: string }> {
  if (!(await requireCategories("delete"))) return { error: "Unauthorized" };

  const courseCount = await Course.count({ where: { categoryId: id } });
  if (courseCount > 0) {
    return {
      error: `Cannot delete: ${courseCount} course${courseCount === 1 ? "" : "s"} still use this category.`,
    };
  }

  await Category.destroy({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePublicCourses();
  return { success: true };
}
