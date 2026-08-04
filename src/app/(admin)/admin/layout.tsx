import { requireRole, getRolePermissions } from "@/lib/access";
import { Role } from "@/lib/types";
import { AdminShell } from "./admin-shell";

/**
 * Everything under here reads the session and queries Postgres per request, so
 * none of it can be prerendered. Without this the build tried to statically
 * export these pages and hit the database at build time - which fails on any
 * host where the database is unreachable during the build step (Vercel).
 */
export const dynamic = "force-dynamic";


// Belt and braces with robots.txt: nothing behind a login should be indexed.
export const metadata = { robots: { index: false, follow: false } };


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // ADMIN and EDITOR both reach the shell; which sections they see is decided
  // by permissions below and enforced per-page by requireResource().
  const session = await requireRole(Role.ADMIN, Role.EDITOR);
  const permissions = await getRolePermissions(session.user.role);

  return (
    <AdminShell
      userName={session.user.name ?? session.user.email}
      userEmail={session.user.email}
      userImage={session.user.image ?? null}
      permissions={permissions}
    >
      {children}
    </AdminShell>
  );
}
