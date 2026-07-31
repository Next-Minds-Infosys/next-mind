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
export const dynamic = "force-dynamic";

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
