import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { PortalShell, type NavItem } from "@/components/lms/portal-shell";

/**
 * Everything under here reads the session and queries Postgres per request, so
 * none of it can be prerendered. Without this the build tried to statically
 * export these pages and hit the database at build time - which fails on any
 * host where the database is unreachable during the build step (Vercel).
 */
export const dynamic = "force-dynamic";


// Belt and braces with robots.txt: nothing behind a login should be indexed.
export const metadata = { robots: { index: false, follow: false } };


const nav: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: "dashboard" },
  { href: "/student/batches", label: "My batches", icon: "batches" },
  { href: "/student/assignments", label: "Assignments", icon: "assignments" },
  { href: "/student/grades", label: "Grades", icon: "grades" },
  { href: "/student/payments", label: "Payments", icon: "payments" },
  { href: "/student/profile", label: "Profile", icon: "profile" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(Role.STUDENT, Role.ADMIN);
  return (
    <PortalShell
      role="Student"
      name={session.user.name ?? session.user.email}
      email={session.user.email}
      nav={nav}
    >
      {children}
    </PortalShell>
  );
}
