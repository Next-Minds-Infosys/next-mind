import SiteLayout from "@/components/SiteLayout";
import EnterprisePage from "@/components/EnterprisePage";
import { getPublicCourses } from "@/db/queries";

// This page and SiteLayout both query Postgres; force dynamic rendering so
// the query runs per-request instead of against a build-time placeholder.
export const dynamic = "force-dynamic";

export default async function Page() {
  const courses = await getPublicCourses();

  return (
    <SiteLayout>
      <EnterprisePage courses={courses} />
    </SiteLayout>
  );
}
