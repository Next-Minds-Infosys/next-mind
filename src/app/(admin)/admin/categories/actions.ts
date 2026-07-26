"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { Category, Course } from "@/db";
import { categorySchema, parseInput, type CategoryInput } from "@/lib/schemas";
import { slugify } from "@/lib/utils";

export type { CategoryInput };

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function createCategory(
  data: CategoryInput
): Promise<{ success: true } | { error: string }> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

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
  return { success: true };
}

export async function updateCategory(
  id: string,
  data: CategoryInput
): Promise<{ success: true } | { error: string }> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

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
  return { success: true };
}

export async function deleteCategory(
  id: string
): Promise<{ success: true } | { error: string }> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const courseCount = await Course.count({ where: { categoryId: id } });
  if (courseCount > 0) {
    return {
      error: `Cannot delete: ${courseCount} course${courseCount === 1 ? "" : "s"} still use this category.`,
    };
  }

  await Category.destroy({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  return { success: true };
}
