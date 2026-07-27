import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPublicCourses } from "@/db/queries";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const courses = await getPublicCourses();

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer courses={courses} />
    </>
  );
}
