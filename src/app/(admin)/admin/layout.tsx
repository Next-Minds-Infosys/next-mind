import { requireRole } from "@/lib/access";
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
