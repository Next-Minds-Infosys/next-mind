import Link from "next/link";
import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { myAssignments } from "@/db/student-queries";
import { Badge, Empty, PageHeader, dueState, fmtDate, panel } from "@/components/lms/ui";

export default async function StudentAssignmentsPage() {
  const session = await requireRole(Role.STUDENT, Role.ADMIN);
  const all = await myAssignments(session.user.id);

  // Outstanding work first, oldest deadline at the top; anything without a due
  // date sorts last so it cannot push a real deadline down the page.
  const rank = (s: string) => ({ overdue: 0, due: 1, submitted: 2, graded: 3 })[s] ?? 4;
  const rows = [...all].sort((a, b) => {
    const d =
      rank(dueState(a.dueAt, a.submittedAt, a.gradedAt)) -
      rank(dueState(b.dueAt, b.submittedAt, b.gradedAt));
    if (d !== 0) return d;
    return (a.dueAt?.getTime() ?? Infinity) - (b.dueAt?.getTime() ?? Infinity);
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader
        eyebrow="Student"
        title="Assignments"
        sub="Every assignment across your batches, most urgent first."
      />
      {rows.length === 0 ? (
        <Empty title="No assignments yet" sub="They will show up here as your instructor sets them." />
      ) : (
        <div className={`${panel} overflow-x-auto p-0`}>
          <table className="w-full min-w-[42rem] text-sm">
            <thead className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-5 py-3 font-medium">Assignment</th>
                <th className="px-5 py-3 font-medium">Batch</th>
                <th className="px-5 py-3 font-medium">Due</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((a) => {
                const state = dueState(a.dueAt, a.submittedAt, a.gradedAt);
                return (
                  <tr key={a.assignmentId}>
                    <td className="px-5 py-3">
                      <Link
                        href={`/student/batches/${a.batchId}`}
                        className="font-medium text-gray-900 hover:text-teal-700"
                      >
                        {a.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{a.batchName}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-500">{fmtDate(a.dueAt)}</td>
                    <td className="px-5 py-3 tabular-nums text-gray-700">
                      {a.score === null ? "—" : `${a.score} / ${a.maxScore}`}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={state}>{state}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
