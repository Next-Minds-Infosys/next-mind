import SiteLayout from "@/components/SiteLayout";
import CoursesListing from "@/components/CoursesListing";
import { getCourseCards } from "@/db/queries";

export const metadata = {
  title: "Courses",
  description:
    "Industry-aligned IT courses in Kathmandu — online and on campus at New Baneshwor.",
  openGraph: { title: "Courses", description: "Industry-aligned IT courses in Kathmandu — online and on campus at New Baneshwor." },
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

export default async function CoursesPage() {
  const courses = await getCourseCards();

  return (
    <SiteLayout>
      <CoursesListing courses={courses} />
    </SiteLayout>
  );
}
