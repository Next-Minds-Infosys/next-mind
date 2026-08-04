import type { MetadataRoute } from "next";
import { Course, Post } from "@/db";
import { absoluteUrl } from "@/lib/site";

/**
 * Course slugs and the blog's freshness come from Postgres, so this must run
 * per-request. Without it the sitemap would be generated at build time against
 * the placeholder connection in src/db/sequelize.ts and ship either empty or
 * permanently stale.
 */
export const dynamic = "force-dynamic";

/** Routes that exist regardless of database contents. */
const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/courses", changeFrequency: "weekly", priority: 0.9 },
  { path: "/enterprise", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/success-stories", changeFrequency: "monthly", priority: 0.6 },
  { path: "/testimonials", changeFrequency: "monthly", priority: 0.5 },
  { path: "/partners", changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // A database hiccup must not take the whole sitemap down - a crawler that
  // gets a 500 here may drop every URL it already knows about. Degrade to the
  // static routes instead.
  let courses: Array<{ slug: string; updatedAt: Date }> = [];
  let blogUpdatedAt: Date | null = null;
  let posts: Array<{ slug: string; updatedAt: Date }> = [];

  try {
    const [courseRows, postRows] = await Promise.all([
      Course.findAll({
        where: { published: true },
        attributes: ["slug", "updatedAt"],
        order: [["updatedAt", "DESC"]],
      }),
      Post.findAll({
        where: { published: true },
        attributes: ["slug", "updatedAt"],
        order: [["updatedAt", "DESC"]],
      }),
    ]);
    courses = courseRows.map((c) => ({ slug: c.slug, updatedAt: c.updatedAt }));
    posts = postRows.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt }));
    blogUpdatedAt = postRows[0]?.updatedAt ?? null;
  } catch (error) {
    console.error("[sitemap] falling back to static routes:", error);
  }

  return [
    ...staticRoutes.map((r) => ({
      url: absoluteUrl(r.path),
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    {
      url: absoluteUrl("/blog"),
      lastModified: blogUpdatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    // Individual posts now have real pages, so they belong in the sitemap.
    ...posts.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...courses.map((c) => ({
      url: absoluteUrl(`/courses/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
