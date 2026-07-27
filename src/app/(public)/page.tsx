import SiteLayout from "@/components/SiteLayout";
import HomePage from "@/components/HomePage";
import { getPublicCourses } from "@/db/queries";

// SiteLayout and this page both query Postgres for course data; without this,
// Next statically prerenders the route at build time and the query runs
// against an unreachable placeholder connection (see src/db/sequelize.ts).
export const dynamic = "force-dynamic";

export default async function Page() {
  const courses = await getPublicCourses();

  return (
    <SiteLayout>
      <HomePage courses={courses} />
    </SiteLayout>
  );
}
