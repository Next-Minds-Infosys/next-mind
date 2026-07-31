import { requireRole } from "@/lib/access";
import { Role } from "@/lib/types";
import { myInvoices } from "@/db/student-queries";
import { npr } from "@/lib/utils";
import { Badge, Empty, PageHeader, Stat, fmtDate, panel } from "@/components/lms/ui";

const tone = (s: string) =>
  s === "PAID" ? "graded" : s === "PARTIAL" ? "due" : s === "CANCELLED" ? "muted" : "overdue";

export default async function StudentPaymentsPage() {
  const session = await requireRole(Role.STUDENT, Role.ADMIN);
  const invoices = await myInvoices(session.user.id);

  const live = invoices.filter((i) => i.status !== "CANCELLED");
  const billed = live.reduce((n, i) => n + i.total, 0);
  const paid = live.reduce((n, i) => n + i.paidAmount, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <PageHeader
        eyebrow="Student"
        title="Payments"
        sub="Your fee statements. Talk to the office to settle a balance."
      />

      {invoices.length === 0 ? (
        <Empty title="No invoices yet" sub="Fee statements will appear here once issued." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <Stat label="Billed" value={npr(billed)} />
            <Stat label="Paid" value={npr(paid)} tone="good" />
            <Stat
              label="Outstanding"
              value={npr(billed - paid)}
              tone={billed - paid > 0 ? "warn" : "good"}
            />
          </div>

          <div className={`${panel} overflow-x-auto p-0`}>
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Issued</th>
                  <th className="px-5 py-3 font-medium">Due</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Paid</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((i) => (
                  <tr key={i.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{i.invoiceNo}</p>
                      <p className="text-xs text-gray-500">
                        {i.description}
                        {i.batch ? ` · ${i.batch}` : ""}
                      </p>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-500">{fmtDate(i.issuedAt)}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-500">{fmtDate(i.dueAt)}</td>
                    <td className="px-5 py-3 tabular-nums">{npr(i.total)}</td>
                    <td className="px-5 py-3 tabular-nums">{npr(i.paidAmount)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={tone(i.status)}>{i.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
