import SiteLayout from "@/components/SiteLayout";
import EnterprisePage from "@/components/EnterprisePage";
import { getCourseCards } from "@/db/queries";

export const metadata = {
  title: "Enterprise Training",
  description:
    "Custom corporate IT training, team upskilling and hiring pipelines for organisations in Nepal.",
  openGraph: { title: "Enterprise Training", description: "Custom corporate IT training, team upskilling and hiring pipelines for organisations in Nepal." },
};


// This page and SiteLayout both query Postgres; force dynamic rendering so
// the query runs per-request instead of against a build-time placeholder.
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
  const courses = await getCourseCards();

  return (
    <SiteLayout>
      <EnterprisePage courses={courses} />
    </SiteLayout>
  );
}
