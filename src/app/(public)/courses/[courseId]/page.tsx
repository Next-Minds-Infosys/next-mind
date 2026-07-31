import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteLayout from "@/components/SiteLayout";
import CoursePageContent from "@/components/CoursePageContent";
import { getPublicCourseBySlug, getPublicCourses } from "@/db/queries";

// No generateStaticParams already makes this dynamic in practice, but this
// makes it explicit rather than relying on Next's inference.
export const dynamic = "force-dynamic";

/**
 * Per-course title, description and share image.
 *
 * These are the pages people actually link to, so a generic site-wide title was
 * costing both search ranking and click-through on shared links.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getPublicCourseBySlug(courseId);
  if (!course) return { title: "Course not found" };

  const description =
    course.shortDesc || course.description.slice(0, 160) || `Learn ${course.title} at Next Minds.`;

  return {
    title: course.title,
    description,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      type: "article",
      title: course.title,
      description,
      url: `/courses/${course.slug}`,
      ...(course.imageUrl ? { images: [{ url: course.imageUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description,
      ...(course.imageUrl ? { images: [course.imageUrl] } : {}),
    },
  };
}

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
