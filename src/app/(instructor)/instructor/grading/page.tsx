import Link from "next/link";
import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { myGradingQueue } from "@/db/instructor-queries";
import { Empty, PageHeader, Stat, fmtDate, panel } from "@/components/lms/ui";

export default async function GradingQueuePage() {
  const session = await requireRole(Role.INSTRUCTOR, Role.ADMIN);
  const rows = await myGradingQueue(session.user.id, session.user.role === Role.ADMIN);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader
        eyebrow="Instructor"
        title="Grading"
        sub="Submissions awaiting a mark, oldest first. Grade them on the batch page."
      />

      {rows.length === 0 ? (
        <Empty title="Nothing to grade" sub="Every submission has been marked." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Awaiting grading" value={rows.length} tone="warn" />
            <Stat
              label="Oldest wait"
              value={fmtDate(rows[0]?.submittedAt ?? null)}
              hint="Submitted"
            />
          </div>

          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.submissionId} className={`${panel} flex flex-wrap items-center justify-between gap-4`}>
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{r.assignmentTitle}</p>
                  <p className="truncate text-sm text-gray-500">
                    {r.studentName} · {r.studentEmail}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {r.batchName} · submitted {fmtDate(r.submittedAt)} · out of {r.maxScore}
                  </p>
                  {r.note && <p className="mt-2 text-sm text-gray-600">“{r.note}”</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {r.storageKey && (
                    <a
                      href={`/api/media/${r.storageKey}`}
                      className="rounded-full px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50"
                    >
                      {r.fileName ?? "Download"}
                    </a>
                  )}
                  <Link
                    href={`/instructor/batches/${r.batchId}`}
                    className="rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white"
                  >
                    Grade
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
