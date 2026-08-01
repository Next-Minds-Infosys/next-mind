/** Pure policy vocabulary - no @/db or @/lib/auth imports; DB-backed lookups live in access.ts. */

/** Resources are fixed (they're real admin sections); which role can do what on them is DB-editable. */
export const RESOURCES = {
  DASHBOARD: "dashboard",
  CATEGORIES: "categories",
  COURSES: "courses",
  BATCHES: "batches",
  MENTORS: "mentors",
  USERS: "users",
  BILLING: "billing",
  EXPENSES: "expenses",
  BLOG: "blog",
  ENROLLMENTS: "enrollments",
  CONTACTS: "contacts",
  ENTERPRISE_INQUIRIES: "enterpriseInquiries",
  POLICIES: "policies",
} as const;
export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];
export const RESOURCE_VALUES = Object.values(RESOURCES) as Resource[];

export const ACTIONS = ["read", "create", "update", "delete"] as const;
export type Action = (typeof ACTIONS)[number];

export type PermissionMap = Partial<Record<Resource, Action[]>>;

/** Priority order for landing a signed-in user on the first resource they can read. */
const ADMIN_LANDING_ROUTES: { resource: Resource; href: string }[] = [
  { resource: RESOURCES.DASHBOARD, href: "/admin" },
  { resource: RESOURCES.BLOG, href: "/admin/blog" },
  { resource: RESOURCES.ENROLLMENTS, href: "/admin/enrollments" },
  { resource: RESOURCES.CONTACTS, href: "/admin/contacts" },
  { resource: RESOURCES.ENTERPRISE_INQUIRIES, href: "/admin/enterprise-inquiries" },
  { resource: RESOURCES.CATEGORIES, href: "/admin/categories" },
  { resource: RESOURCES.COURSES, href: "/admin/courses" },
  { resource: RESOURCES.BATCHES, href: "/admin/batches" },
  { resource: RESOURCES.MENTORS, href: "/admin/mentors" },
  { resource: RESOURCES.BILLING, href: "/admin/billing" },
  { resource: RESOURCES.EXPENSES, href: "/admin/expenses" },
  { resource: RESOURCES.USERS, href: "/admin/users" },
  { resource: RESOURCES.POLICIES, href: "/admin/policies" },
];

export function canAccess(
  permissions: PermissionMap,
  resource: Resource,
  action: Action = "read",
): boolean {
  return permissions[resource]?.includes(action) ?? false;
}

/** Where to send someone inside /admin who just failed a resource check. */
export function adminLandingFor(permissions: PermissionMap): string {
  const match = ADMIN_LANDING_ROUTES.find((r) => canAccess(permissions, r.resource, "read"));
  return match?.href ?? "/login";
}

/** True if this change would leave ADMIN unable to read Policies - the last-admin guard for policies. */
export function wouldLockOutAdmins(candidateAdminPermissions: PermissionMap): boolean {
  return !canAccess(candidateAdminPermissions, RESOURCES.POLICIES, "read");
}
