"use server";

import { revalidatePath } from "next/cache";
import { Op } from "sequelize";
import { Invoice } from "@/db";
import { invoiceSchema, parseInput } from "@/lib/schemas";
import { RESOURCES, type Action } from "@/lib/policies";
import { sessionCan } from "@/lib/access";

type Result = { success: true } | { error: string };

async function requireBilling(action: Action) {
  const { session, allowed } = await sessionCan(RESOURCES.BILLING, action);
  if (!session || !allowed) return null;
  return session;
}

/**
 * NM-<year>-<counter>. Derived from the highest existing number for the year
 * rather than a row count, so deleting an invoice can never cause a reuse.
 */
async function nextInvoiceNo() {
  const year = new Date().getFullYear();
  const prefix = `NM-${year}-`;
  const latest = await Invoice.findOne({
    where: { invoiceNo: { [Op.like]: `${prefix}%` } },
    attributes: ["invoiceNo"],
    order: [["invoiceNo", "DESC"]],
  });
  const seq = latest ? Number(latest.invoiceNo.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

function derive(amount: number, discount: number, paidAmount: number, status: string) {
  const total = amount - discount;
  // Keep status honest with the numbers rather than trusting the dropdown.
  if (status === "CANCELLED") return { total, status };
  if (paidAmount <= 0) return { total, status: "UNPAID" };
  if (paidAmount >= total) return { total, status: "PAID" };
  return { total, status: "PARTIAL" };
}

export async function createInvoice(data: unknown): Promise<Result> {
  const session = await requireBilling("create");
  if (!session) return { error: "Unauthorized" };

  const parsed = parseInput(invoiceSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const d = parsed.data;
  const { total, status } = derive(d.amount, d.discount, d.paidAmount, d.status);

  await Invoice.create({
    invoiceNo: await nextInvoiceNo(),
    userId: d.userId,
    batchId: d.batchId || null,
    description: d.description,
    amount: d.amount,
    discount: d.discount,
    total,
    paidAmount: d.paidAmount,
    status,
    method: d.method || null,
    issuedAt: d.issuedAt || new Date().toISOString().slice(0, 10),
    dueAt: d.dueAt || null,
    paidAt: status === "PAID" ? new Date().toISOString().slice(0, 10) : null,
    note: d.note || null,
    createdById: session.user.id,
  });

  revalidatePath("/admin/billing");
  return { success: true };
}

export async function recordPayment(id: string, amount: number, method: string): Promise<Result> {
  if (!(await requireBilling("update"))) return { error: "Unauthorized" };
  if (!Number.isInteger(amount) || amount <= 0) return { error: "Enter a whole amount above 0." };

  const invoice = await Invoice.findByPk(id);
  if (!invoice) return { error: "Invoice not found." };
  if (invoice.status === "CANCELLED") return { error: "This invoice is cancelled." };

  const paid = invoice.paidAmount + amount;
  if (paid > invoice.total) return { error: "That is more than the outstanding balance." };

  await invoice.update({
    paidAmount: paid,
    method: method || invoice.method,
    status: paid >= invoice.total ? "PAID" : "PARTIAL",
    paidAt: paid >= invoice.total ? new Date().toISOString().slice(0, 10) : invoice.paidAt,
  });

  revalidatePath("/admin/billing");
  return { success: true };
}

export async function cancelInvoice(id: string): Promise<Result> {
  if (!(await requireBilling("update"))) return { error: "Unauthorized" };
  await Invoice.update({ status: "CANCELLED" }, { where: { id } });
  revalidatePath("/admin/billing");
  return { success: true };
}

export async function updateInvoice(id: string, data: unknown): Promise<Result> {
  if (!(await requireBilling("update"))) return { error: "Unauthorized" };

  const parsed = parseInput(invoiceSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const d = parsed.data;

  const invoice = await Invoice.findByPk(id);
  if (!invoice) return { error: "Invoice not found." };

  // invoiceNo is never reissued - it is the reference the customer already has.
  const { total, status } = derive(d.amount, d.discount, d.paidAmount, d.status);

  await invoice.update({
    userId: d.userId,
    batchId: d.batchId || null,
    description: d.description,
    amount: d.amount,
    discount: d.discount,
    total,
    paidAmount: d.paidAmount,
    status,
    method: d.method || null,
    issuedAt: d.issuedAt || invoice.issuedAt,
    dueAt: d.dueAt || null,
    paidAt: status === "PAID" ? (invoice.paidAt ?? new Date().toISOString().slice(0, 10)) : null,
    note: d.note || null,
  });

  revalidatePath("/admin/billing");
  return { success: true };
}

/**
 * Hard delete, for invoices raised by mistake. Cancelling is the right move for
 * a real invoice that is no longer payable - it keeps the number in the ledger.
 */
export async function deleteInvoice(id: string): Promise<Result> {
  if (!(await requireBilling("delete"))) return { error: "Unauthorized" };

  const invoice = await Invoice.findByPk(id);
  if (!invoice) return { error: "Invoice not found." };
  if (invoice.paidAmount > 0) {
    return { error: "Money has been recorded against this invoice — cancel it instead of deleting." };
  }

  await invoice.destroy();
  revalidatePath("/admin/billing");
  return { success: true };
}
