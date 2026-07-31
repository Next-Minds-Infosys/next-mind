import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { PortalShell } from "@/components/lms/portal-shell";

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
