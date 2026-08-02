"use server";

import { revalidatePath } from "next/cache";
import { Op } from "sequelize";
import { Post } from "@/db";
import { parseInput, postSchema } from "@/lib/schemas";
import { estimateReadTime, slugify } from "@/lib/utils";
import { RESOURCES, type Action } from "@/lib/policies";
import { sessionCan } from "@/lib/access";

type Result = { success: true } | { error: string };

async function requireBlog(action: Action) {
  const { session, allowed } = await sessionCan(RESOURCES.BLOG, action);
  if (!session || !allowed) return null;
  return session;
}

/** Slugs are permanent URLs, so a collision gets a numeric suffix rather than overwriting. */
async function uniqueSlug(source: string, excludeId?: string) {
  const base = slugify(source);
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
  const session = await requireBlog("create");
  if (!session) return { error: "Unauthorized" };

  const parsed = parseInput(postSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const d = parsed.data;

  await Post.create({
    slug: await uniqueSlug(d.slug || d.title),
    title: d.title,
    excerpt: d.excerpt || null,
    contentMd: d.contentMd,
    category: d.category || null,
    emoji: d.emoji || null,
    coverKey: d.coverKey || null,
    readTime: estimateReadTime(d.contentMd),
    authorName: d.authorName || session.user.name || null,
    authorId: session.user.id,
    featured: d.featured,
    published: d.published,
    publishedAt: d.published ? new Date() : null,
    metaTitle: d.metaTitle || null,
    metaDescription: d.metaDescription || null,
    focusKeyword: d.focusKeyword || null,
    canonicalUrl: d.canonicalUrl || null,
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function updatePost(id: string, data: unknown): Promise<Result> {
  if (!(await requireBlog("update"))) return { error: "Unauthorized" };

  const parsed = parseInput(postSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const d = parsed.data;

  const post = await Post.findByPk(id);
  if (!post) return { error: "Post not found." };

  const desiredSlug = slugify(d.slug || d.title);

  await post.update({
    slug: desiredSlug === post.slug ? post.slug : await uniqueSlug(d.slug || d.title, id),
    title: d.title,
    excerpt: d.excerpt || null,
    contentMd: d.contentMd,
    category: d.category || null,
    emoji: d.emoji || null,
    coverKey: d.coverKey || null,
    readTime: estimateReadTime(d.contentMd),
    authorName: d.authorName || post.authorName,
    featured: d.featured,
    published: d.published,
    // Set the publish date on first publish, then leave it alone.
    publishedAt: d.published ? (post.publishedAt ?? new Date()) : null,
    metaTitle: d.metaTitle || null,
    metaDescription: d.metaDescription || null,
    focusKeyword: d.focusKeyword || null,
    canonicalUrl: d.canonicalUrl || null,
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function deletePost(id: string): Promise<Result> {
  if (!(await requireBlog("delete"))) return { error: "Unauthorized" };
  await Post.destroy({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}
