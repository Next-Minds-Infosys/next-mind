import SiteLayout from "@/components/SiteLayout";
import CoursesListing from "@/components/CoursesListing";
import { getPublicCourses } from "@/db/queries";

export const metadata = {
  title: "Courses",
  description:
    "Industry-aligned IT courses in Kathmandu — online and on campus at New Baneshwor.",
  openGraph: { title: "Courses", description: "Industry-aligned IT courses in Kathmandu — online and on campus at New Baneshwor." },
};


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
