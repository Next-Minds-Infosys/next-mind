import Link from "next/link";
import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { myBatchCards } from "@/db/student-queries";
import { Badge, Empty, PageHeader, Progress, panel } from "@/components/lms/ui";

export default async function StudentBatchesPage() {
  const session = await requireRole(Role.STUDENT, Role.ADMIN);
  const cards = await myBatchCards(session.user.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader eyebrow="Student" title="My batches" sub="Everything you are enrolled in." />
      {cards.length === 0 ? (
        <Empty title="No batches yet" sub="Your enrollment will appear here once confirmed." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
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
                  <span className="shrink-0 text-xs tabular-nums text-gray-500">{c.percent}%</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
