import { revalidatePath } from "next/cache";

/**
 * On-demand purging of the cached public pages.
 *
 * The public routes moved from `force-dynamic` to `revalidate = 300` so they
 * can be served from the CDN and can enter the browser's back/forward cache.
 * That alone would leave admin edits invisible for up to five minutes; these
 * helpers close the gap by purging the affected paths the moment something is
 * saved, so the cache stays fast *and* current.
 *
 * Call them from admin server actions, after the write succeeds.
 */

/**
 * Course data reaches every public page, not just the course routes:
 * `SiteLayout` calls `getPublicCourses()` and `Footer` renders the list, so a
 * renamed or unpublished course would otherwise sit stale in the footer of
 * /about, /contact and the rest. "layout" scope purges the whole public tree,
 * which is the only correct option here.
 *
 * Admin routes are unaffected - they are still rendered per request.
 */
export function revalidatePublicCourses() {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}

/**
 * Posts appear only under /blog, so this stays targeted. The `[slug]` page
 * scope purges every post page at once, which also covers a renamed slug or a
 * deleted post - neither of which we can address by path alone.
 */
export function revalidatePublicPosts() {
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/sitemap.xml");
}
