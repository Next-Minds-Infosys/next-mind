export const Role = {
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
  INSTRUCTOR: "INSTRUCTOR",
  STUDENT: "STUDENT",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const SubmissionStatus = {
  PENDING: "PENDING",
  CONTACTED: "CONTACTED",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
} as const;
export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

export const EmailJobStatus = {
  PENDING: "PENDING",
  SENT: "SENT",
  FAILED: "FAILED",
} as const;
export type EmailJobStatus = (typeof EmailJobStatus)[keyof typeof EmailJobStatus];

export const CourseBadge = {
  NEW: "New",
  TRENDING: "Trending",
  MOST_POPULAR: "Most Popular",
  HIGH_DEMAND: "High Demand",
  PREMIUM: "Premium",
} as const;
export type CourseBadge = (typeof CourseBadge)[keyof typeof CourseBadge];
