import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "./admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login?next=/admin");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <AdminShell userName={session.user.name ?? session.user.email} userEmail={session.user.email}>
      {children}
    </AdminShell>
  );
}
