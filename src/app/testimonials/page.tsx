import SiteLayout from "@/components/SiteLayout";
import TestimonialsPage from "./testimonials-content";

export const metadata = {
  title: "Testimonials",
  description:
    "What our students say about training at Next Minds Infosys.",
  openGraph: { title: "Testimonials", description: "What our students say about training at Next Minds Infosys." },
};


// SiteLayout queries Postgres for footer course links; force dynamic
// rendering so that query runs per-request, not against a build-time
// placeholder connection (see src/db/sequelize.ts).
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SiteLayout>
      <TestimonialsPage />
    </SiteLayout>
  );
}
