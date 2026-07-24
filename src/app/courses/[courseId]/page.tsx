import { notFound } from "next/navigation";
import SiteLayout from "@/components/SiteLayout";
import CoursePageContent from "@/components/CoursePageContent";
import { courses, getCourseBySlug } from "@/data/courses";

export function generateStaticParams() {
  return courses.map((c) => ({ courseId: c.slug }));
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = getCourseBySlug(courseId);

  if (!course) {
    notFound();
  }

  return (
    <SiteLayout>
      <CoursePageContent course={course} />
    </SiteLayout>
  );
}
