import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPublicCourses } from "@/db/queries";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const courses = await getPublicCourses();

  return (
    <>
      {/*
        Keyboard users had to tab through the entire nav - main links, the
        Company dropdown, contact, sign-in, enroll - on every page before
        reaching the content. Visually hidden until focused.
      */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-nm-navy focus:shadow-lg focus:ring-2 focus:ring-teal-500"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">{children}</main>
      <Footer courses={courses} />
    </>
  );
}
