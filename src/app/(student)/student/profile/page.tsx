import Link from "next/link";
import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { User } from "@/db";
import { myBatchCards, myDashboardStats } from "@/db/student-queries";
import { npr } from "@/lib/utils";
import { PageHeader, Stat, fmtDate, panel } from "@/components/lms/ui";

export default async function StudentProfilePage() {
  const session = await requireRole(Role.STUDENT, Role.ADMIN);
  const [user, cards, stats] = await Promise.all([
    User.findByPk(session.user.id, { attributes: ["name", "email", "role", "createdAt"] }),
    myBatchCards(session.user.id),
    myDashboardStats(session.user.id),
  ]);

  const rows: [string, string][] = [
    ["Name", user?.name ?? "—"],
    ["Email", user?.email ?? session.user.email],
    ["Role", user?.role ?? "STUDENT"],
    ["Member since", fmtDate(user?.createdAt ?? null)],
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <PageHeader eyebrow="Student" title="Profile" sub="Your account and enrollment details." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Batches" value={cards.length} />
        <Stat label="Progress" value={`${stats.overallPercent}%`} tone="good" />
        <Stat label="Average score" value={stats.averageScore === null ? "—" : `${stats.averageScore}%`} />
        <Stat label="Outstanding" value={npr(stats.outstanding)} tone={stats.outstanding > 0 ? "warn" : "good"} />
      </div>

      <section className={panel}>
        <h2 className="mb-4 font-semibold text-gray-900">Account</h2>
        <dl className="divide-y divide-gray-100">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3">
              <dt className="text-sm text-gray-500">{k}</dt>
              <dd className="break-all text-sm font-medium text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-gray-500">
          Contact the office to change your name or email — they are used on your invoices and
          certificates.
        </p>
        <Link
          href="/account/change-password"
          className="mt-4 inline-block rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white"
        >
          Change password
        </Link>
      </section>

      <section className={panel}>
        <h2 className="mb-4 font-semibold text-gray-900">Enrollments</h2>
        {cards.length === 0 ? (
          <p className="text-sm text-gray-500">Not enrolled in any batch yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {cards.map((c) => (
              <li key={c.batchId} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/student/batches/${c.batchId}`}
                    className="truncate font-medium text-gray-900 hover:text-teal-700"
                  >
                    {c.name}
                  </Link>
                  <p className="truncate text-xs text-gray-500">
                    {c.code} · {c.courseTitle}
                  </p>
                </div>
                <span className="shrink-0 text-sm tabular-nums text-gray-500">{c.percent}%</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
