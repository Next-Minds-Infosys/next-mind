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


// ---------------------------------------------------------------------- LMS

export const roleSchema = z.enum(["ADMIN", "INSTRUCTOR", "STUDENT"]);

export const batchSchema = z.object({
  courseId: z.string().trim().min(1, "Course is required."),
  instructorId: z.string().trim().optional().or(z.literal("")).default(""),
  name: trimmed(2, 120, "Batch name"),
  code: trimmed(2, 40, "Batch code"),
  startDate: z.string().trim().optional().or(z.literal("")).default(""),
  endDate: z.string().trim().optional().or(z.literal("")).default(""),
  schedule: optionalText(200),
  mode: z.enum(["Physical", "Online", "Hybrid"]).default("Physical"),
  capacity: z.coerce.number().int().min(0).default(0),
  status: z.enum(["UPCOMING", "RUNNING", "COMPLETED"]).default("UPCOMING"),
});
export type BatchInput = z.infer<typeof batchSchema>;
export type BatchFormValues = z.input<typeof batchSchema>;

export const lessonSchema = z.object({
  title: trimmed(2, 200, "Title"),
  description: optionalText(2000),
  orderIndex: z.coerce.number().int().min(0).default(0),
  videoKey: z.string().trim().optional().or(z.literal("")).default(""),
  videoMime: z.string().trim().optional().or(z.literal("")).default(""),
  videoSizeBytes: z.coerce.number().int().min(0).optional(),
  published: z.boolean().default(false),
});
export type LessonInput = z.infer<typeof lessonSchema>;

export const materialSchema = z.object({
  lessonId: z.string().trim().optional().or(z.literal("")).default(""),
  title: trimmed(2, 200, "Title"),
  storageKey: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  mimeType: z.string().trim().optional().or(z.literal("")).default(""),
  sizeBytes: z.coerce.number().int().min(0).optional(),
  downloadable: z.boolean().default(true),
});
export type MaterialInput = z.infer<typeof materialSchema>;

export const assignmentSchema = z.object({
  title: trimmed(2, 200, "Title"),
  briefMd: z.string().trim().max(20_000).default(""),
  attachmentKey: z.string().trim().optional().or(z.literal("")).default(""),
  attachmentName: z.string().trim().optional().or(z.literal("")).default(""),
  dueAt: z.string().trim().optional().or(z.literal("")).default(""),
  maxScore: z.coerce.number().int().min(1).max(1000).default(100),
  published: z.boolean().default(true),
});
export type AssignmentInput = z.infer<typeof assignmentSchema>;

export const submissionSchema = z.object({
  assignmentId: z.string().trim().min(1),
  storageKey: z.string().trim().optional().or(z.literal("")).default(""),
  fileName: z.string().trim().optional().or(z.literal("")).default(""),
  note: optionalText(2000),
});
export type SubmissionInput = z.infer<typeof submissionSchema>;

export const gradeSchema = z.object({
  submissionId: z.string().trim().min(1),
  score: z.coerce.number().int().min(0),
  feedback: optionalText(4000),
});
export type GradeInput = z.infer<typeof gradeSchema>;

export const messageSchema = z.object({
  batchId: z.string().trim().min(1),
  body: trimmed(1, 4000, "Message"),
  parentId: z.string().trim().optional().or(z.literal("")).default(""),
});
export type MessageInput = z.infer<typeof messageSchema>;

export const postSchema = z.object({
  title: trimmed(2, 200, "Title"),
  excerpt: optionalText(500),
  contentMd: z.string().trim().max(100_000).default(""),
  category: optionalText(80),
  emoji: optionalText(8),
  readTime: optionalText(40),
  authorName: optionalText(120),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});
export type PostInput = z.infer<typeof postSchema>;
export type PostFormValues = z.input<typeof postSchema>;

/**
 * Admin-created accounts. ADMIN is deliberately not creatable here - a new
 * admin has to be promoted deliberately from the users table, so a mis-click on
 * a create form cannot mint one.
 */
export const createUserSchema = z.object({
  name: trimmed(2, 120, "Name"),
  email,
  role: z.enum(["INSTRUCTOR", "STUDENT"]),
  /** Where the one-time password goes. It is revealed through exactly one of these. */
  delivery: z.enum(["email", "hand"]).default("email"),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateUserFormValues = z.input<typeof createUserSchema>;

/**
 * Editing an existing account. Role is deliberately absent - it has its own
 * action (updateUserRole) with the last-admin and self-demotion guards, and
 * routing it through here would bypass them.
 */
export const updateUserSchema = z.object({
  name: trimmed(2, 120, "Name"),
  email,
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ------------------------------------------------------- Next Minds (finance)

/** Money is whole rupees. Never a float - decimal cents do not survive binary FP. */
const rupees = (labelText: string) =>
  z.coerce.number().int(`${labelText} must be a whole number.`).min(0, `${labelText} cannot be negative.`);

export const invoiceSchema = z
  .object({
    userId: z.string().trim().min(1, "Student is required."),
    batchId: z.string().trim().optional().or(z.literal("")).default(""),
    description: trimmed(2, 300, "Description"),
    amount: rupees("Amount"),
    discount: rupees("Discount").default(0),
    paidAmount: rupees("Paid amount").default(0),
    status: z.enum(["UNPAID", "PARTIAL", "PAID", "CANCELLED"]).default("UNPAID"),
    method: optionalText(40),
    issuedAt: z.string().trim().optional().or(z.literal("")).default(""),
    dueAt: z.string().trim().optional().or(z.literal("")).default(""),
    note: optionalText(1000),
  })
  .refine((d) => d.discount <= d.amount, {
    message: "Discount cannot exceed the amount.",
    path: ["discount"],
  })
  .refine((d) => d.paidAmount <= d.amount - d.discount, {
    message: "Paid amount cannot exceed the total.",
    path: ["paidAmount"],
  });
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceFormValues = z.input<typeof invoiceSchema>;

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Salaries",
  "Utilities",
  "Internet",
  "Equipment",
  "Marketing",
  "Supplies",
  "Maintenance",
  "Other",
] as const;

export const expenseSchema = z.object({
  title: trimmed(2, 200, "Title"),
  category: z.enum(EXPENSE_CATEGORIES).default("Other"),
  amount: rupees("Amount"),
  vendor: optionalText(160),
  spentAt: z.string().trim().min(1, "Date is required."),
  note: optionalText(1000),
  receiptKey: z.string().trim().optional().or(z.literal("")).default(""),
  receiptName: z.string().trim().optional().or(z.literal("")).default(""),
});
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type ExpenseFormValues = z.input<typeof expenseSchema>;

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
