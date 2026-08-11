import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SiteLayout from "@/components/SiteLayout";
import { JsonLd } from "@/components/JsonLd";
import { articleSchema, breadcrumbSchema } from "@/lib/schema-org";
import { Post } from "@/db";
import { colors } from "@/lib/theme";

// Reads Postgres per request, like every other public page.
export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  return Post.findOne({ where: { slug, published: true } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // notFound() must fire HERE, not in the page body. Once a route streams (the
  // root loading.tsx creates a Suspense boundary, so every dynamic page does),
  // the 200 status is already committed and a later notFound() only swaps the
  // body - a soft 404 that Google will happily index. generateMetadata runs
  // before the response starts, so the status is still ours to set.
  const post = await getPost(slug);
  if (!post) notFound();

  // The SEO fields win when set - they are written to target a specific query
  // and are usually not the same string as the on-page headline.
  const seoTitle = post.metaTitle?.trim() || post.title;
  const description =
    post.metaDescription?.trim() || post.excerpt || post.contentMd.slice(0, 160);

  return {
    title: seoTitle,
    description,
    alternates: { canonical: post.canonicalUrl?.trim() || `/blog/${post.slug}` },
    keywords: post.focusKeyword ? [post.focusKeyword] : undefined,
    openGraph: {
      type: "article",
      title: seoTitle,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
      authors: post.authorName ? [post.authorName] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description,
      images: ["/assets/og-default.png"],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  // A draft or a bad slug is a genuine 404, not an empty page.
  if (!post) notFound();

  const published = post.publishedAt ?? post.createdAt;

  return (
    <SiteLayout>
      <JsonLd
        data={articleSchema({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt ?? "",
          authorName: post.authorName,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      <article className="mx-auto max-w-3xl px-6 pb-20 pt-28">
        <Link href="/blog" className="text-sm font-medium" style={{ color: colors.teal }}>
          ← All articles
        </Link>

        <header className="mt-6 mb-10">
          {post.category && (
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-bold"
              style={{ backgroundColor: `${colors.teal}15`, color: colors.teal }}
            >
              {post.category}
            </span>
          )}
          <h1
            className="font-display mt-4 text-3xl font-bold leading-tight sm:text-4xl"
            style={{ color: colors.navy }}
          >
            {post.emoji ? `${post.emoji} ` : ""}
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-lg leading-relaxed" style={{ color: colors.body }}>
              {post.excerpt}
            </p>
          )}
          {/* A visible date is what makes the Article result eligible and tells
              a reader whether the advice is current. */}
          <p className="mt-4 text-sm" style={{ color: colors.muted }}>
            {post.authorName ?? "Next Minds Team"} ·{" "}
            <time dateTime={published.toISOString()}>
              {published.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
            {post.readTime ? ` · ${post.readTime}` : ""}
          </p>
        </header>

        <div className="nm-prose leading-relaxed" style={{ color: colors.body }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.contentMd}</ReactMarkdown>
        </div>

        <div
          className="mt-14 rounded-2xl p-8 text-center"
          style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <h2 className="font-display text-xl font-bold" style={{ color: colors.navy }}>
            Ready to start learning?
          </h2>
          <p className="mt-2 text-sm" style={{ color: colors.muted }}>
            Browse our industry-aligned IT courses in Kathmandu.
          </p>
          <Link
            href="/courses"
            className="mt-5 inline-block rounded-full px-6 py-3 text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${colors.teal}, ${colors.blue})` }}
          >
            Browse Courses
          </Link>
        </div>
      </article>
    </SiteLayout>
  );
}
