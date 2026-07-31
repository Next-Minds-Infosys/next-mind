import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { PortalShell } from "@/components/lms/portal-shell";

/**
 * Everything under here reads the session and queries Postgres per request, so
 * none of it can be prerendered. Without this the build tried to statically
 * export these pages and hit the database at build time - which fails on any
 * host where the database is unreachable during the build step (Vercel).
 */
export const dynamic = "force-dynamic";


// Belt and braces with robots.txt: nothing behind a login should be indexed.
export const metadata = { robots: { index: false, follow: false } };


const nav = [
  { href: "/instructor", label: "Dashboard", icon: "🏠" },
  { href: "/instructor/batches", label: "My batches", icon: "📚" },
  { href: "/instructor/grading", label: "Grading", icon: "🎯" },
];

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  // The real gate. Middleware only verified that *a* session exists.
  const session = await requireRole(Role.INSTRUCTOR, Role.ADMIN);
  return (
    <PortalShell
      role="Instructor"
      name={session.user.name ?? session.user.email}
      email={session.user.email}
      nav={nav}
    >
      {children}
    </PortalShell>
  );
}
