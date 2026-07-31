import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Everything behind a login is disallowed. This is a crawl hint, not a security
 * control - the real gate is src/lib/access.ts - but it keeps the dashboard and
 * the student portal out of search results and stops crawlers wasting budget on
 * URLs that only ever redirect.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/instructor", "/student", "/login", "/register", "/api"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
