import Link from "next/link";
import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { myBatchOverview } from "@/db/instructor-queries";
import { Badge, Empty, PageHeader, panel } from "@/components/lms/ui";

export default async function InstructorBatchesPage() {
  const session = await requireRole(Role.INSTRUCTOR, Role.ADMIN);
  const cards = await myBatchOverview(session.user.id, session.user.role === Role.ADMIN);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader eyebrow="Instructor" title="My batches" sub="Everything you are teaching." />
      {cards.length === 0 ? (
        <Empty title="No batches assigned yet" />
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
                  <Badge tone={b.status === "ACTIVE" ? "graded" : "muted"}>{b.status}</Badge>
                </div>
                <p className="mt-3 text-xs text-gray-400">
                  {b.students} student{b.students === 1 ? "" : "s"} · {b.assignments} assignment
                  {b.assignments === 1 ? "" : "s"} · {b.ungraded} to grade
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
