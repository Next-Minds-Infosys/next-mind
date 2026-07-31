import SiteLayout from "@/components/SiteLayout";
import AboutPage from "./about-content";

export const metadata = {
  title: "About Us",
  description:
    "Building Nepal's next generation of IT talent — our story, mission and team.",
  openGraph: { title: "About Us", description: "Building Nepal's next generation of IT talent — our story, mission and team." },
};


// SiteLayout queries Postgres for footer course links; force dynamic
// rendering so that query runs per-request, not against a build-time
// placeholder connection (see src/db/sequelize.ts).
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SiteLayout>
      <AboutPage />
    </SiteLayout>
  );
}
