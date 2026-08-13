import SiteLayout from "@/components/SiteLayout";
import HomePage from "@/components/HomePage";
import { getPublicCourses } from "@/db/queries";

// SiteLayout and this page both query Postgres for course data; without this,
// Next statically prerenders the route at build time and the query runs
// against an unreachable placeholder connection (see src/db/sequelize.ts).
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
  const courses = await getPublicCourses();

  return (
    <SiteLayout>
      <HomePage courses={courses} />
    </SiteLayout>
  );
}
