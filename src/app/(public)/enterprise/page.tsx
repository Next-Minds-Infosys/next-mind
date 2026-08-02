import SiteLayout from "@/components/SiteLayout";
import EnterprisePage from "@/components/EnterprisePage";
import { getPublicCourses } from "@/db/queries";

export const metadata = {
  title: "Enterprise Training",
  description:
    "Custom corporate IT training, team upskilling and hiring pipelines for organisations in Nepal.",
  openGraph: { title: "Enterprise Training", description: "Custom corporate IT training, team upskilling and hiring pipelines for organisations in Nepal." },
};


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
