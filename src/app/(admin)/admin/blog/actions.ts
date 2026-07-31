"use server";

import { revalidatePath } from "next/cache";
import { Op } from "sequelize";
import { Post } from "@/db";
import { getSession } from "@/lib/auth";
import { Role } from "@/lib/types";
import { parseInput, postSchema } from "@/lib/schemas";
import { slugify } from "@/lib/utils";

type Result = { success: true } | { error: string };

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== Role.ADMIN) return null;
  return session;
}

/** Slugs are permanent URLs, so a collision gets a numeric suffix rather than overwriting. */
async function uniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title);
  let slug = base;
  let n = 1;
  for (;;) {
    const clash = await Post.findOne({
      where: excludeId ? { slug, id: { [Op.ne]: excludeId } } : { slug },
      attributes: ["id"],
    });
    if (!clash) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function createPost(data: unknown): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized" };

  const parsed = parseInput(postSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const d = parsed.data;

  await Post.create({
    slug: await uniqueSlug(d.title),
    title: d.title,
    excerpt: d.excerpt || null,
    contentMd: d.contentMd,
    category: d.category || null,
    emoji: d.emoji || null,
    readTime: d.readTime || null,
    authorName: d.authorName || session.user.name || null,
    authorId: session.user.id,
    featured: d.featured,
    published: d.published,
    publishedAt: d.published ? new Date() : null,
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function updatePost(id: string, data: unknown): Promise<Result> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const parsed = parseInput(postSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const d = parsed.data;

  const post = await Post.findByPk(id);
  if (!post) return { error: "Post not found." };

  await post.update({
    slug: post.title === d.title ? post.slug : await uniqueSlug(d.title, id),
    title: d.title,
    excerpt: d.excerpt || null,
    contentMd: d.contentMd,
    category: d.category || null,
    emoji: d.emoji || null,
    readTime: d.readTime || null,
    authorName: d.authorName || post.authorName,
    featured: d.featured,
    published: d.published,
    // Set the publish date on first publish, then leave it alone.
    publishedAt: d.published ? (post.publishedAt ?? new Date()) : null,
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function deletePost(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  await Post.destroy({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}
