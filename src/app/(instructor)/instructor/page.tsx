import Link from "next/link";
import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { myBatchOverview } from "@/db/instructor-queries";
import { Badge, Empty, PageHeader, Stat, panel } from "@/components/lms/ui";

export default async function InstructorDashboard() {
  const session = await requireRole(Role.INSTRUCTOR, Role.ADMIN);
  const isAdmin = session.user.role === Role.ADMIN;
  const cards = await myBatchOverview(session.user.id, isAdmin);

  const students = cards.reduce((n, c) => n + c.students, 0);
  const ungraded = cards.reduce((n, c) => n + c.ungraded, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader
        eyebrow="Instructor"
        title={`Welcome back, ${session.user.name ?? "Instructor"}`}
        sub="Your batches and what needs your attention."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Batches" value={cards.length} href="/instructor/batches" />
        <Stat label="Students" value={students} />
        <Stat
          label="Awaiting grading"
          value={ungraded}
          tone={ungraded > 0 ? "warn" : "good"}
          href="/instructor/grading"
        />
      </div>

      {cards.length === 0 ? (
        <Empty
          title="No batches assigned yet"
          sub="An admin needs to assign you to a batch before it appears here."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {cards.map((b) => (
            <li key={b.id}>
              <Link
                href={`/instructor/batches/${b.id}`}
                className={`${panel} block h-full transition hover:ring-teal-500/30`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-teal-600">
                      {b.code}
                    </p>
                    <p className="mt-1 truncate font-semibold text-gray-900">{b.name}</p>
                    <p className="truncate text-sm text-gray-500">{b.courseTitle}</p>
                  </div>
                  {b.ungraded > 0 ? (
                    <Badge tone="overdue">{b.ungraded} to grade</Badge>
                  ) : (
                    <Badge tone={b.status === "ACTIVE" ? "graded" : "muted"}>{b.status}</Badge>
                  )}
                </div>
                <p className="mt-3 text-xs text-gray-400">
                  {b.students} student{b.students === 1 ? "" : "s"} · {b.assignments} assignment
                  {b.assignments === 1 ? "" : "s"} · {b.mode}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
