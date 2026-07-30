import Link from "next/link";
import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { myDashboardStats } from "@/db/student-queries";
import { npr } from "@/lib/utils";
import { Badge, Empty, PageHeader, Progress, Stat, dueState, fmtDate, panel } from "@/components/lms/ui";

export default async function StudentDashboard() {
  const session = await requireRole(Role.STUDENT, Role.ADMIN);
  const s = await myDashboardStats(session.user.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader
        eyebrow="Student"
        title={`Welcome back, ${session.user.name ?? "Student"}`}
        sub="Your batches, deadlines and progress at a glance."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Active batches" value={s.batches} href="/student/batches" />
        <Stat
          label={s.overdue > 0 ? "Overdue" : "Due this week"}
          value={s.overdue > 0 ? s.overdue : s.dueThisWeek}
          tone={s.overdue > 0 ? "warn" : "default"}
          href="/student/assignments"
        />
        <Stat
          label="Awaiting grade"
          value={s.awaitingGrade}
          hint={s.averageScore !== null ? `Average ${s.averageScore}%` : undefined}
          href="/student/grades"
        />
        <Stat
          label="Outstanding"
          value={npr(s.outstanding)}
          tone={s.outstanding > 0 ? "warn" : "good"}
          href="/student/payments"
        />
      </div>

      {s.cards.length === 0 ? (
        <Empty
          title="You are not in a batch yet"
          sub="Once your enrollment is confirmed, your batch will appear here."
        />
      ) : (
        <>
          <section className={panel}>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-semibold text-gray-900">Overall progress</h2>
              <span className="text-sm tabular-nums text-gray-500">{s.overallPercent}%</span>
            </div>
            <Progress percent={s.overallPercent} />
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-gray-900">My batches</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {s.cards.map((c) => (
                <li key={c.batchId}>
                  <Link
                    href={`/student/batches/${c.batchId}`}
                    className={`${panel} block h-full transition hover:ring-teal-500/30`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-teal-600">
                          {c.code}
                        </p>
                        <p className="mt-1 truncate font-semibold text-gray-900">{c.name}</p>
                        <p className="truncate text-sm text-gray-500">{c.courseTitle}</p>
                      </div>
                      <Badge tone={c.status === "ACTIVE" ? "graded" : "muted"}>{c.status}</Badge>
                    </div>
                    {c.instructor && (
                      <p className="mt-3 text-xs text-gray-400">Instructor: {c.instructor}</p>
                    )}
                    {c.schedule && <p className="text-xs text-gray-400">{c.schedule}</p>}
                    <div className="mt-4 flex items-center gap-3">
                      <Progress percent={c.percent} />
                      <span className="shrink-0 text-xs tabular-nums text-gray-500">
                        {c.doneLessons}/{c.totalLessons}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className={panel}>
            <h2 className="mb-4 font-semibold text-gray-900">Coming up</h2>
            {s.upcoming.length === 0 ? (
              <p className="text-sm text-gray-500">Nothing outstanding — you are all caught up.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {s.upcoming.map((a) => (
                  <li key={a.assignmentId} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/student/batches/${a.batchId}`}
                        className="truncate font-medium text-gray-900 hover:text-teal-700"
                      >
                        {a.title}
                      </Link>
                      <p className="truncate text-xs text-gray-500">{a.batchName}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-gray-500">{fmtDate(a.dueAt)}</span>
                      <Badge tone={dueState(a.dueAt, a.submittedAt, a.gradedAt)}>
                        {dueState(a.dueAt, a.submittedAt, a.gradedAt)}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
