import { notFound } from "next/navigation";
import SiteLayout from "@/components/SiteLayout";
import CoursePageContent from "@/components/CoursePageContent";
import { getCourseById } from "@/data/courses";

export function generateStaticParams() {
  return [
    { courseId: "mern-stack" },
    { courseId: "python-django" },
    { courseId: "ui-ux-design" },
    { courseId: "flutter-development" },
    { courseId: "digital-marketing" },
    { courseId: "data-science-ai" },
  ];
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) {
    notFound();
  }

  return (
    <SiteLayout>
      <CoursePageContent course={course} />
    </SiteLayout>
  );
}
