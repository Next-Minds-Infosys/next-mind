import SiteLayout from "@/components/SiteLayout";
import CoursesListing from "@/components/CoursesListing";
import { getPublicCourses } from "@/db/queries";

// This page and SiteLayout both query Postgres; force dynamic rendering so
// the query runs per-request instead of against a build-time placeholder.
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getPublicCourses();

  return (
    <SiteLayout>
      <CoursesListing courses={courses} />
    </SiteLayout>
  );
}
