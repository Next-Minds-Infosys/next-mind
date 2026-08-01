import { notFound } from "next/navigation";
import { Post } from "@/db";
import { requireResource } from "@/lib/access";
import { RESOURCES } from "@/lib/policies";
import { PostEditor } from "../../post-editor";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireResource(RESOURCES.BLOG, "update");
  const { id } = await params;
  const post = await Post.findByPk(id);
  if (!post) notFound();

  return (
    <PostEditor
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        contentMd: post.contentMd,
        category: post.category ?? "",
        emoji: post.emoji ?? "",
        coverKey: post.coverKey ?? "",
        authorName: post.authorName ?? "",
        featured: post.featured,
        published: post.published,
        metaTitle: post.metaTitle ?? "",
        metaDescription: post.metaDescription ?? "",
        focusKeyword: post.focusKeyword ?? "",
        canonicalUrl: post.canonicalUrl ?? "",
      }}
    />
  );
}
