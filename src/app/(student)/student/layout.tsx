import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { PortalShell } from "@/components/lms/portal-shell";

const nav = [
  { href: "/student", label: "Dashboard", icon: "🏠" },
  { href: "/student/batches", label: "My batches", icon: "📚" },
  { href: "/student/assignments", label: "Assignments", icon: "📝" },
  { href: "/student/grades", label: "Grades", icon: "🎯" },
  { href: "/student/payments", label: "Payments", icon: "🧾" },
  { href: "/student/profile", label: "Profile", icon: "👤" },
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
