import { z } from "zod";

/**
 * Single source of truth for every user-supplied input.
 *
 * The same schema is used on the client (react-hook-form via zodResolver) and
 * on the server (API routes / server actions). Client validation is a UX
 * convenience only - anything can POST to the routes directly, so the server
 * must re-validate with the same schema rather than trust the payload.
 */

const trimmed = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be under ${max} characters.`);

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("")).default("");

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address."));

/** Nepali mobile: 10 digits starting 97/98, with or without +977 and separators. */
const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-()]/g, ""))
  .refine((v) => /^(\+?977)?9[78]\d{8}$/.test(v), "Enter a valid Nepali mobile number.");

const optionalPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-()]/g, ""))
  .refine((v) => v === "" || /^(\+?977)?9[78]\d{8}$/.test(v), "Enter a valid Nepali mobile number.")
  .optional()
  .default("");

// ---------------------------------------------------------------- public API

export const enrollSchema = z.object({
  fullName: trimmed(2, 120, "Full name"),
  email,
  phone,
  address: optionalText(200),
  course: trimmed(1, 160, "Course"),
  educationLevel: optionalText(80),
  learningFormat: z.enum(["Physical", "Online", "Hybrid"]).default("Physical"),
  hasLaptop: z.enum(["Yes", "No"]).default("Yes"),
});
export type EnrollInput = z.infer<typeof enrollSchema>;
export type EnrollFormValues = z.input<typeof enrollSchema>;

export const contactSchema = z.object({
  name: trimmed(2, 120, "Name"),
  email,
  phone: optionalPhone,
  courseInterest: optionalText(160),
  message: trimmed(10, 2000, "Message"),
});
export type ContactInput = z.infer<typeof contactSchema>;
export type ContactFormValues = z.input<typeof contactSchema>;

export const enterpriseContactSchema = z.object({
  name: trimmed(2, 120, "Name"),
  orgName: trimmed(2, 160, "Organization name"),
  email,
  phone,
  orgType: optionalText(80),
  teamSize: optionalText(40),
  trainingInterests: optionalText(2000),
});
export type EnterpriseContactInput = z.infer<typeof enterpriseContactSchema>;
export type EnterpriseContactFormValues = z.input<typeof enterpriseContactSchema>;

// --------------------------------------------------------------------- auth

export const loginSchema = z.object({
  email,
  password: z.string().min(8, "Password must be at least 8 characters."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: trimmed(2, 120, "Name"),
    email,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be under 128 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

// -------------------------------------------------------------------- admin

/** Shape stored in Course.curriculum (JSONB). */
export const curriculumModuleSchema = z.object({
  id: z.string().trim().optional(),
  title: trimmed(2, 200, "Module title"),
  topics: z.array(z.string().trim().min(1)).default([]),
  description: z.string().trim().max(2000).optional(),
  duration: z.string().trim().max(80).optional(),
});

/** Shape stored in Course.faqs (JSONB). */
export const faqSchema = z.object({
  q: trimmed(3, 300, "Question"),
  a: trimmed(3, 2000, "Answer"),
});

export const courseSchema = z.object({
  title: trimmed(2, 160, "Title"),
  categoryId: z.string().trim().min(1, "Category is required."),
  description: trimmed(10, 4000, "Description"),
  shortDesc: optionalText(300),
  contentMd: z.string().trim().max(50_000).default(""),
  tools: z.array(z.string().trim().min(1)).max(30).default([]),
  whoIsItFor: z.array(z.string().trim().min(1)).max(20).default([]),
  skills: z.array(z.string().trim().min(1)).max(40).default([]),
  curriculum: z.array(curriculumModuleSchema).max(50).default([]),
  faqs: z.array(faqSchema).max(50).default([]),
  badge: optionalText(60),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour, e.g. #00bdb8.")
    .or(z.literal(""))
    .default(""),
  students: z.coerce.number().int().min(0, "Students must be 0 or more.").default(0),
  duration: trimmed(1, 80, "Duration"),
  level: trimmed(1, 80, "Level"),
  price: z.coerce.number().int().min(0, "Price must be 0 or more."),
  imageUrl: z.string().trim().max(500).optional().or(z.literal("")).default(""),
  mentorId: z.string().trim().optional().or(z.literal("")).default(""),
  published: z.boolean().default(true),
});
export type CourseInput = z.infer<typeof courseSchema>;
export type CourseFormValues = z.input<typeof courseSchema>;

export const categorySchema = z.object({
  name: trimmed(2, 80, "Name"),
  description: optionalText(500),
});
export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryFormValues = z.input<typeof categorySchema>;

export const mentorSchema = z.object({
  name: trimmed(2, 120, "Name"),
  role: trimmed(2, 120, "Role"),
  bio: trimmed(10, 2000, "Bio"),
  photo: z.string().trim().max(500).optional().or(z.literal("")).default(""),
});
export type MentorInput = z.infer<typeof mentorSchema>;
export type MentorFormValues = z.input<typeof mentorSchema>;

// ------------------------------------------------------------------ helpers

/**
 * Server-side guard. Returns either parsed data or the first readable error,
 * matching the `{ error }` contract the actions and routes already use.
 */
export type ParseResult<T> = { success: true; data: T } | { success: false; error: string };

export function parseInput<T extends z.ZodType>(
  schema: T,
  payload: unknown,
): ParseResult<z.infer<T>> {
  const result = schema.safeParse(payload);
  if (result.success) return { success: true, data: result.data };
  const first = result.error.issues[0];
  const field = first?.path.join(".");
  return {
    success: false,
    error: field ? `${field}: ${first.message}` : (first?.message ?? "Invalid input."),
  };
}
