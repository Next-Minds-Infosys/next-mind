import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteLayout from "@/components/SiteLayout";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, courseSchema, faqSchema } from "@/lib/schema-org";
import CoursePageContent from "@/components/CoursePageContent";
import { getPublicCourseBySlug, getPublicCourses } from "@/db/queries";
import { publicMediaSrc } from "@/lib/media-image";

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
  // notFound() must fire HERE, not in the page body. Once a route streams (the
  // root loading.tsx creates a Suspense boundary, so every dynamic page does),
  // the 200 status is already committed and a later notFound() only swaps the
  // body - a soft 404 that Google will happily index. generateMetadata runs
  // before the response starts, so the status is still ours to set.
  const course = await getPublicCourseBySlug(courseId);
  if (!course) notFound();

  // Hand-written SEO copy wins over the on-page fields when present. A written
  // title tag already carries the brand, so `absolute` skips the root layout's
  // "%s — Next Minds Infosys" template rather than pushing it past ~60 chars.
  const seoTitle = course.metaTitle?.trim();
  const description =
    course.metaDescription?.trim() ||
    course.shortDesc ||
    course.description.slice(0, 160) ||
    `Learn ${course.title} at Next Minds.`;
  const socialTitle = course.ogTitle?.trim() || seoTitle || course.title;
  const socialDescription = course.ogDescription?.trim() || description;
  const imageSrc = publicMediaSrc(course.imageUrl);
  const imageAlt = course.ogImageAlt?.trim() || `${course.title} at Next Minds Infosys`;

  return {
    title: seoTitle ? { absolute: seoTitle } : course.title,
    description,
    keywords: course.focusKeyword ? [course.focusKeyword] : undefined,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      type: "article",
      title: socialTitle,
      description: socialDescription,
      url: `/courses/${course.slug}`,
      ...(imageSrc ? { images: [{ url: imageSrc, alt: imageAlt }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
      ...(imageSrc ? { images: [imageSrc] } : {}),
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
      {/* Course rich result: price, duration, provider and delivery mode. */}
      <JsonLd
        data={courseSchema({
          slug: course.slug,
          title: course.title,
          description: course.shortDesc || course.description,
          price: course.price,
          duration: course.duration,
          level: course.level,
          imageUrl: course.imageUrl,
          category: course.category,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Courses", path: "/courses" },
          { name: course.title, path: `/courses/${course.slug}` },
        ])}
      />
      {course.faqs.length > 0 && <JsonLd data={faqSchema(course.faqs)} />}
      <CoursePageContent course={course} courses={courses} />
    </SiteLayout>
  );
}
