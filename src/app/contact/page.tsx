import SiteLayout from "@/components/SiteLayout";
import ContactPage from "./contact-content";

export const metadata = {
  title: "Contact",
  description:
    "Talk to a course advisor at Next Minds Infosys, New Baneshwor, Kathmandu.",
  openGraph: { title: "Contact", description: "Talk to a course advisor at Next Minds Infosys, New Baneshwor, Kathmandu." },
};


// SiteLayout queries Postgres for footer course links; force dynamic
// rendering so that query runs per-request, not against a build-time
// placeholder connection (see src/db/sequelize.ts).
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

export default function Page() {
  return (
    <SiteLayout>
      <ContactPage />
    </SiteLayout>
  );
}
