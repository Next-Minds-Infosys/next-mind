import coursesData from "./v2-courses.json";
import testimonialsData from "./testimonials.json";
import successStoriesData from "./success-stories.json";
import instructorsData from "./instructors.json";
import type { CourseBadge } from "@/lib/types";

export interface CurriculumModule {
  title: string;
  topics: string[];
}

export interface Faq {
  q: string;
  a: string;
}

export interface Course {
  id: number;
  slug: string;
  title: string;
  category: string;
  duration: string;
  level: string;
  price: number;
  badge: CourseBadge | null;
  icon: string;
  color: string;
  students: number;
  tools: string[];
  shortDesc: string;
  description: string;
  whoIsItFor: string[];
  skills: string[];
  curriculum: CurriculumModule[];
  faqs: Faq[];
}

export const courses = coursesData as Course[];

export const testimonials = testimonialsData as {
  name: string;
  role: string;
  emoji: string;
  course: string;
  quote: string;
}[];

export const successStories = successStoriesData as {
  id: number;
  name: string;
  emoji: string;
  role: string;
  company: string;
  before: string;
  after: string;
  salary: string;
  course: string;
  quote: string;
}[];

export interface Instructor {
  name: string;
  role: string;
  emoji: string;
  photo: string | null;
  bio: string;
}

export const instructors = instructorsData as Record<string, Instructor>;

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getInstructorBySlug(slug: string): Instructor | undefined {
  return instructors[slug];
}

export const companyLinks = [
  { label: "About Us", href: "/about", icon: "🏫" },
  { label: "Blog", href: "/blog", icon: "📝" },
  { label: "Success Stories", href: "/success-stories", icon: "🏆" },
  { label: "Testimonials", href: "/testimonials", icon: "💬" },
  { label: "Partners", href: "/partners", icon: "🤝" },
];
