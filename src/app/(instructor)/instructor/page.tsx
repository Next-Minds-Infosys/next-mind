import Link from "next/link";
import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { myBatchOverview, myGradingQueue } from "@/db/instructor-queries";
import { Badge, Empty, PageHeader, Panel, PanelTitle, StatCard, relativeTime } from "@/components/lms/ui";
import { Clock } from "lucide-react";

export default async function InstructorDashboard() {
  const session = await requireRole(Role.INSTRUCTOR, Role.ADMIN);
  const isAdmin = session.user.role === Role.ADMIN;
  const [cards, queue] = await Promise.all([
    myBatchOverview(session.user.id, isAdmin),
    myGradingQueue(session.user.id, isAdmin),
  ]);

  const students = cards.reduce((n, c) => n + c.students, 0);
  const ungraded = cards.reduce((n, c) => n + c.ungraded, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <PageHeader
        eyebrow="Instructor"
        title={`Welcome back, ${session.user.name ?? "Instructor"}`}
        sub="Your batches and what needs your attention."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Batches" value={cards.length} href="/instructor/batches" />
        <StatCard label="Students" value={students} />
        <StatCard
          label="Awaiting grading"
          value={ungraded}
          attention={ungraded > 0}
          href="/instructor/grading"
        />
      </div>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-nm-navy">My batches</h2>
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
                  className="block h-full rounded-2xl border border-nm-border bg-white p-6 transition hover:border-teal-500/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                        {b.code}
                      </p>
                      <p className="mt-1 truncate font-semibold text-nm-navy">{b.name}</p>
                      <p className="truncate text-sm text-nm-muted">{b.courseTitle}</p>
                    </div>
                    {b.ungraded > 0 ? (
                      <Badge tone="overdue">{b.ungraded} to grade</Badge>
                    ) : (
                      <Badge tone={b.status === "ACTIVE" ? "graded" : "muted"}>{b.status}</Badge>
                    )}
                  </div>
                  <p className="mt-4 text-xs text-nm-muted">
                    {b.students} student{b.students === 1 ? "" : "s"} · {b.assignments} assignment
                    {b.assignments === 1 ? "" : "s"} · {b.mode}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Work waiting on the instructor, pulled straight from the grading queue
          so the dashboard names the specific submission rather than only
          counting it. Hidden entirely when there is nothing outstanding. */}
      {queue.length > 0 && (
        <Panel>
          <PanelTitle>Needs your attention</PanelTitle>
          <ul className="divide-y divide-nm-border">
            {queue.slice(0, 8).map((row) => (
              <li key={row.submissionId} className="flex items-center gap-4 px-6 py-4">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Clock size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-nm-navy">
                    {row.studentName} submitted {row.assignmentTitle}
                  </p>
                  <p className="text-sm text-nm-muted">
                    Submitted {relativeTime(row.submittedAt)} · awaiting grade
                  </p>
                </div>
                <Link
                  href={`/instructor/batches/${row.batchId}`}
                  className="flex-shrink-0 rounded-lg border border-nm-border px-4 py-2 text-sm font-semibold text-nm-navy transition-colors hover:bg-nm-surface"
                >
                  Grade
                </Link>
              </li>
            ))}
          </ul>
          {queue.length > 8 && (
            <div className="border-t border-nm-border px-6 py-3">
              <Link
                href="/instructor/grading"
                className="text-sm font-semibold text-teal-700 hover:text-teal-800"
              >
                View all {queue.length} submissions →
              </Link>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
