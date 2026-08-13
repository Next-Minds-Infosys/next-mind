import SiteLayout from "@/components/SiteLayout";
import BlogPage from "./blog-content";
import { Post } from "@/db";

export const metadata = {
  title: "Blog",
  description:
    "Careers, technology and industry insight from the Next Minds Infosys team.",
  openGraph: { title: "Blog", description: "Careers, technology and industry insight from the Next Minds Infosys team." },
};


// SiteLayout queries Postgres for footer course links; force dynamic
// rendering so that query runs per-request, not against a build-time
// placeholder connection (see src/db/sequelize.ts).
/**
 * Cached and revalidated rather than rendered per request.
 *
 * `force-dynamic` made Next send `Cache-Control: private, no-store` on every
 * response, which (a) disables the browser's back/forward cache entirely and
 * (b) meant every visit rendered from scratch against the database with
 * `x-vercel-cache: MISS`. Nothing on this page is per-visitor - the navbar
 * reads its session client-side - so it can be served from the CDN and
 * refreshed on an interval. Admin edits appear within the window below.
 */
export const revalidate = 300;

export default async function Page() {
  const rows = await Post.findAll({
    where: { published: true },
    order: [
      ["featured", "DESC"],
      ["publishedAt", "DESC"],
    ],
  });

  const posts = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? "",
    category: p.category ?? "Career",
    emoji: p.emoji ?? "📝",
    author: p.authorName ?? "Next Minds Team",
    readTime: p.readTime ?? "",
    featured: p.featured,
  }));

  return (
    <SiteLayout>
      <BlogPage posts={posts} />
    </SiteLayout>
  );
}
