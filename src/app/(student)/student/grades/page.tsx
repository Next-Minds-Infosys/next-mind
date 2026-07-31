import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { myAssignments } from "@/db/student-queries";
import { Empty, PageHeader, Progress, Stat, fmtDate, panel } from "@/components/lms/ui";

export default async function StudentGradesPage() {
  const session = await requireRole(Role.STUDENT, Role.ADMIN);
  const graded = (await myAssignments(session.user.id)).filter(
    (a) => a.gradedAt !== null && a.score !== null,
  );

  const scored = graded.reduce((n, a) => n + (a.score ?? 0), 0);
  const max = graded.reduce((n, a) => n + a.maxScore, 0);
  const average = max === 0 ? null : Math.round((scored / max) * 100);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader
        eyebrow="Student"
        title="Grades"
        sub="Scores and instructor feedback for everything you have submitted."
      />

      {graded.length === 0 ? (
        <Empty title="Nothing graded yet" sub="Grades appear once your instructor marks your work." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Graded" value={graded.length} />
            <Stat label="Average" value={average === null ? "—" : `${average}%`} tone="good" />
            <Stat label="Marks earned" value={`${scored} / ${max}`} />
          </div>

          <ul className="space-y-4">
            {graded.map((a) => {
              const pct = a.maxScore === 0 ? 0 : Math.round(((a.score ?? 0) / a.maxScore) * 100);
              return (
                <li key={a.assignmentId} className={panel}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{a.title}</p>
                      <p className="text-xs text-gray-500">
                        {a.batchName} · graded {fmtDate(a.gradedAt)}
                      </p>
                    </div>
                    <p className="text-lg font-semibold tabular-nums text-gray-900">
                      {a.score} <span className="text-sm text-gray-400">/ {a.maxScore}</span>
                    </p>
                  </div>
                  <div className="mt-3">
                    <Progress percent={pct} />
                  </div>
                  {a.feedback && (
                    <div className="mt-4 rounded-xl bg-gray-50 p-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Feedback
                      </p>
                      <p className="whitespace-pre-wrap text-sm text-gray-700">{a.feedback}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
