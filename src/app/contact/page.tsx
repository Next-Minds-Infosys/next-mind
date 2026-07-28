import SiteLayout from "@/components/SiteLayout";
import ContactPage from "./contact-content";

// SiteLayout queries Postgres for footer course links; force dynamic
// rendering so that query runs per-request, not against a build-time
// placeholder connection (see src/db/sequelize.ts).
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SiteLayout>
      <ContactPage />
    </SiteLayout>
  );
}
