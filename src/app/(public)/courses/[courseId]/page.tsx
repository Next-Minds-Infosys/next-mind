import { notFound } from "next/navigation";
import SiteLayout from "@/components/SiteLayout";
import CoursePageContent from "@/components/CoursePageContent";
import { getPublicCourseBySlug, getPublicCourses } from "@/db/queries";

// No generateStaticParams already makes this dynamic in practice, but this
// makes it explicit rather than relying on Next's inference.
export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const [course, courses] = await Promise.all([
    getPublicCourseBySlug(courseId),
    getPublicCourses(),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <SiteLayout>
      <CoursePageContent course={course} courses={courses} />
    </SiteLayout>
  );
}
