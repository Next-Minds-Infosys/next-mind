import { Batch, Invoice, User } from "@/db";
import { Role } from "@/lib/types";
import { requireResource } from "@/lib/access";
import { RESOURCES } from "@/lib/policies";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { npr } from "@/lib/utils";
import { DeleteInvoice, EditInvoice, InvoiceActions, NewInvoice } from "./billing-client";

const RING = "ring-1 ring-gray-950/5";

export default async function BillingPage() {
  await requireResource(RESOURCES.BILLING);
  const [invoices, students, batches] = await Promise.all([
    Invoice.findAll({
      include: [
        { model: User, as: "student", attributes: ["name", "email"] },
        { model: Batch, as: "batch", attributes: ["name", "code"] },
      ],
      order: [["createdAt", "DESC"]],
    }),
    User.findAll({
      where: { role: Role.STUDENT },
      attributes: ["id", "name", "email"],
      order: [["name", "ASC"]],
    }),
    Batch.findAll({ attributes: ["id", "name", "code"], order: [["createdAt", "DESC"]] }),
  ]);

  const live = invoices.filter((i) => i.status !== "CANCELLED");
  const billed = live.reduce((n, i) => n + i.total, 0);
  const collected = live.reduce((n, i) => n + i.paidAmount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-500">Generate and track student bills.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { l: "Billed", v: npr(billed) },
          { l: "Collected", v: npr(collected) },
          { l: "Outstanding", v: npr(billed - collected) },
          { l: "Invoices", v: String(live.length) },
        ].map((s) => (
          <div key={s.l} className={`rounded-2xl bg-white p-5 ${RING}`}>
            <p className="text-2xl font-semibold tabular-nums text-gray-900">{s.v}</p>
            <p className="mt-0.5 text-sm text-gray-500">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>
                    <p className="font-medium text-gray-900">{i.invoiceNo}</p>
                    <p className="text-xs text-gray-500">{i.description}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{i.student?.name ?? i.student?.email}</p>
                    {i.batch && <p className="text-xs text-gray-400">{i.batch.code}</p>}
                  </TableCell>
                  <TableCell className="tabular-nums">{npr(i.total)}</TableCell>
                  <TableCell className="tabular-nums">{npr(i.paidAmount)}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        i.status === "PAID"
                          ? "bg-teal-50 text-teal-700"
                          : i.status === "PARTIAL"
                            ? "bg-amber-50 text-amber-700"
                            : i.status === "CANCELLED"
                              ? "bg-gray-100 text-gray-500"
                              : "bg-red-50 text-red-700"
                      }`}
                    >
                      {i.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <InvoiceActions
                      id={i.id}
                      outstanding={i.total - i.paidAmount}
                      cancelled={i.status === "CANCELLED"}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <EditInvoice
                        students={students.map((u) => ({ id: u.id, name: u.name, email: u.email }))}
                        batches={batches.map((b) => ({ id: b.id, name: b.name, code: b.code }))}
                        invoice={{
                          id: i.id,
                          invoiceNo: i.invoiceNo,
                          userId: i.userId,
                          batchId: i.batchId ?? "",
                          description: i.description,
                          amount: i.amount,
                          discount: i.discount,
                          paidAmount: i.paidAmount,
                          status: i.status as "UNPAID" | "PARTIAL" | "PAID" | "CANCELLED",
                          method: i.method ?? "",
                          issuedAt: i.issuedAt ?? "",
                          dueAt: i.dueAt ?? "",
                          note: i.note ?? "",
                        }}
                      />
                      {i.paidAmount === 0 && <DeleteInvoice id={i.id} invoiceNo={i.invoiceNo} />}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {invoices.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">No bills yet.</p>
          )}
        </div>

        <aside className={`h-fit rounded-2xl bg-white p-6 ${RING}`}>
          <h2 className="mb-4 font-semibold text-gray-900">New bill</h2>
          {students.length === 0 ? (
            <p className="text-sm text-gray-500">
              No students yet — create one in Users first.
            </p>
          ) : (
            <NewInvoice
              students={students.map((u) => ({ id: u.id, name: u.name, email: u.email }))}
              batches={batches.map((b) => ({ id: b.id, name: b.name, code: b.code }))}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
