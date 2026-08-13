import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CustomCodeInjector } from "@/components/CustomCodeInjector";
import { getPublicCourses } from "@/db/queries";
import { SiteSetting } from "@/db";
import { SITE_SETTING_ID } from "@/db/models/site-setting";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [courses, siteSetting] = await Promise.all([
    getPublicCourses(),
    SiteSetting.findByPk(SITE_SETTING_ID),
  ]);

  return (
    <>
      {/* Admin-managed, from /admin/custom-code - public site only, never the dashboards. */}
      {siteSetting?.customCss && (
        <style dangerouslySetInnerHTML={{ __html: siteSetting.customCss }} />
      )}
      {siteSetting?.customScript && <CustomCodeInjector script={siteSetting.customScript} />}
      {/*
        Keyboard users had to tab through the entire nav - main links, the
        Company dropdown, contact, sign-in, enroll - on every page before
        reaching the content. Hidden until focused; see .skip-link in globals.css.
      */}
      <a
        href="#main"
        className="skip-link"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">{children}</main>
      <Footer courses={courses} />
    </>
  );
}
