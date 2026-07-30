import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { AdminShell } from "./admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Was a hand-rolled `role !== "ADMIN"` check. Going through requireRole keeps
  // this in step with the instructor and student portals: it also enforces the
  // must-change-password rule, which the local check silently skipped, and it
  // sends a wrong-role visitor to their own dashboard instead of the homepage.
  const session = await requireRole(Role.ADMIN);

  return (
    <AdminShell userName={session.user.name ?? session.user.email} userEmail={session.user.email}>
      {children}
    </AdminShell>
  );
}
