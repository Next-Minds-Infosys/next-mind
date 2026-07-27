import { cache } from "react";
import { Category, Course, Mentor } from "./index";
import type { CurriculumModule, Faq } from "./models/course";

/**
 * Shape the public marketing site renders. Joins Category to a plain name
 * string (public pages have no reason to know about categoryId) and falls
 * back sensibly on the columns that are nullable in Postgres but were never
 * optional in the static JSON this replaces.
 */
export interface PublicCourse {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  shortDesc: string;
  contentMd: string;
  tools: string[];
  whoIsItFor: string[];
  skills: string[];
  curriculum: CurriculumModule[];
  faqs: Faq[];
  badge: string | null;
  color: string;
  students: number;
  duration: string;
  level: string;
  price: number;
  imageUrl: string | null;
  mentor: { name: string; role: string; bio: string; photo: string | null } | null;
}

function toPublicCourse(course: Course): PublicCourse {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    category: course.category?.name ?? "General",
    description: course.description,
    shortDesc: course.shortDesc || course.description,
    contentMd: course.contentMd,
    tools: course.tools,
    whoIsItFor: course.whoIsItFor,
    skills: course.skills,
    curriculum: course.curriculum,
    faqs: course.faqs,
    badge: course.badge,
    color: course.color || "#00bdb8",
    students: course.students,
    duration: course.duration,
    level: course.level,
    price: course.price,
    imageUrl: course.imageUrl,
    mentor: course.mentor
      ? {
          name: course.mentor.name,
          role: course.mentor.role,
          bio: course.mentor.bio,
          photo: course.mentor.photo,
        }
      : null,
  };
}

const courseIncludes = [
  { model: Category, as: "category" as const, attributes: ["name"] },
  { model: Mentor, as: "mentor" as const, attributes: ["name", "role", "bio", "photo"] },
];

export const getPublicCourses = cache(async (): Promise<PublicCourse[]> => {
  const courses = await Course.findAll({
    where: { published: true },
    include: courseIncludes,
    order: [["createdAt", "DESC"]],
  });
  return courses.map(toPublicCourse);
});

export const getPublicCourseBySlug = cache(async (slug: string): Promise<PublicCourse | null> => {
  const course = await Course.findOne({
    where: { slug, published: true },
    include: courseIncludes,
  });
  return course ? toPublicCourse(course) : null;
});
