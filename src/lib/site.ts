/**
 * Canonical public origin, used by sitemap.xml and robots.txt.
 *
 * Search engines need absolute URLs, and they must be the origin visitors
 * actually reach - a relative path or a localhost URL in a deployed sitemap is
 * worse than no sitemap. NEXT_PUBLIC_SITE_URL is the override; the production
 * domain is the default so a missing variable degrades to the right answer
 * rather than to localhost.
 */
const FALLBACK = "https://www.nextmindsinfosys.com";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK).replace(/\/+$/, "");

/** Joins a route onto the site origin. `path` is expected to start with "/". */
export function absoluteUrl(path = "/") {
  return path === "/" ? siteUrl : `${siteUrl}${path}`;
}
