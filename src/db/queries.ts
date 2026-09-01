import { cache } from "react";
import { Op } from "sequelize";
import { BatchStudent, Category, Course, Mentor, User } from "./index";
import { Role, type CourseBadge } from "@/lib/types";
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
  badge: CourseBadge | null;
  color: string;
  students: number;
  duration: string;
  level: string;
  price: number;
  imageUrl: string | null;
  mentor: { name: string; role: string; bio: string; photo: string | null } | null;
  h1: string | null;
  h1Accent: string | null;
  nextBatch: string | null;
  syllabusUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageAlt: string | null;
  focusKeyword: string | null;
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
    h1: course.h1,
    h1Accent: course.h1Accent,
    nextBatch: course.nextBatch,
    syllabusUrl: course.syllabusUrl,
    metaTitle: course.metaTitle,
    metaDescription: course.metaDescription,
    ogTitle: course.ogTitle,
    ogDescription: course.ogDescription,
    ogImageAlt: course.ogImageAlt,
    focusKeyword: course.focusKeyword,
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


/**
 * The subset every course *card* renders - grids, the nav, the footer, the
 * enrol modal and the related-courses list.
 *
 * The previous `getPublicCourses()` returned the whole row - `contentMd`, `faqs`,
 * `curriculum` and the SEO fields. SiteLayout handed that to Footer, which
 * renders three fields, so ~190KB of course markdown was serialised into the
 * RSC payload of *every* page on the site - /about and /contact included. The
 * homepage was 300KB of HTML, 69% of it this payload.
 */
export interface CourseCard {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  shortDesc: string;
  tools: string[];
  badge: CourseBadge | null;
  color: string;
  students: number;
  duration: string;
  level: string;
  price: number;
}

const CARD_ATTRIBUTES = [
  "id",
  "slug",
  "title",
  "categoryId",
  "description",
  "shortDesc",
  "tools",
  "badge",
  "color",
  "students",
  "duration",
  "level",
  "price",
] as const;

export const getCourseCards = cache(async (): Promise<CourseCard[]> => {
  const courses = await Course.findAll({
    where: { published: true },
    attributes: [...CARD_ATTRIBUTES],
    include: [{ model: Category, as: "category", attributes: ["name"] }],
    order: [["createdAt", "DESC"]],
  });

  return courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    category: c.category?.name ?? "General",
    description: c.description,
    shortDesc: c.shortDesc || c.description,
    tools: c.tools ?? [],
    badge: c.badge,
    color: c.color ?? "#00bdb8",
    students: c.students,
    duration: c.duration,
    level: c.level,
    price: c.price,
  }));
});

export const getPublicCourseBySlug = cache(async (slug: string): Promise<PublicCourse | null> => {
  const course = await Course.findOne({
    where: { slug, published: true },
    include: courseIncludes,
  });
  return course ? toPublicCourse(course) : null;
});

/**
 * Option lists for admin forms, already flattened to plain objects.
 *
 * Sequelize returns Model instances, which carry a toJSON method - React
 * refuses to serialise those across the server/client boundary ("Only plain
 * objects can be passed to Client Components"). Returning them pre-mapped means
 * a page cannot forget to convert, which is exactly how that bug got in.
 */
export const listCourseOptions = cache(async (): Promise<{ id: string; title: string }[]> => {
  const rows = await Course.findAll({ attributes: ["id", "title"], order: [["title", "ASC"]] });
  return rows.map((c) => ({ id: c.id, title: c.title }));
});

export const listInstructorOptions = cache(
  async (): Promise<{ id: string; name: string | null; email: string }[]> => {
    const rows = await User.findAll({
      where: { role: { [Op.in]: [Role.INSTRUCTOR, Role.ADMIN] } },
      attributes: ["id", "name", "email"],
      order: [["name", "ASC"]],
    });
    return rows.map((u) => ({ id: u.id, name: u.name, email: u.email }));
  },
);

/**
 * Students who can still be added to a batch: STUDENT role, not already on its
 * roster. Accounts are created in Users - the roster only picks from them.
 */
export async function listEnrollableStudents(batchId: string) {
  const taken = await BatchStudent.findAll({ where: { batchId }, attributes: ["userId"] });
  const takenIds = taken.map((t) => t.userId);
  const rows = await User.findAll({
    where: {
      role: Role.STUDENT,
      ...(takenIds.length ? { id: { [Op.notIn]: takenIds } } : {}),
    },
    attributes: ["id", "name", "email"],
    order: [["name", "ASC"]],
  });
  return rows.map((u) => ({ id: u.id, name: u.name, email: u.email }));
}
