import SiteLayout from "@/components/SiteLayout";
import PartnersPage from "./partners-content";

export const metadata = {
  title: "Partners",
  description:
    "The hiring and technology partners we work with across Nepal.",
  openGraph: { title: "Partners", description: "The hiring and technology partners we work with across Nepal." },
};


// SiteLayout queries Postgres for footer course links; force dynamic
// rendering so that query runs per-request, not against a build-time
// placeholder connection (see src/db/sequelize.ts).
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SiteLayout>
      <PartnersPage />
    </SiteLayout>
  );
}
