"use client";

import { npr } from "@/lib/utils";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceFormValues, type InvoiceInput } from "@/lib/schemas";
import { cancelInvoice, createInvoice, recordPayment, updateInvoice, deleteInvoice } from "./actions";

const input =
  "w-full rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500";
const label = "text-sm font-medium text-gray-700";


/**
 * Create and edit share this form. With `initial` it targets updateInvoice;
 * the invoice number is never part of it - that reference is already with the
 * customer and must not change under them.
 */
export function NewInvoice({
  students,
  batches,
  initial,
  onDone,
}: {
  students: { id: string; name: string | null; email: string }[];
  batches: { id: string; name: string; code: string }[];
  initial?: InvoiceFormValues & { id: string };
  onDone?: () => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues, unknown, InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initial ?? {
      userId: students[0]?.id ?? "",
      batchId: "",
      description: "",
      amount: 0,
      discount: 0,
      paidAmount: 0,
      status: "UNPAID",
      method: "",
      issuedAt: new Date().toISOString().slice(0, 10),
      dueAt: "",
      note: "",
    },
  });

  const amount = Number(watch("amount") ?? 0);
  const discount = Number(watch("discount") ?? 0);
  const total = Math.max(0, amount - discount);

  const err = (n: keyof InvoiceFormValues) =>
    errors[n] && <p className="mt-1 text-xs text-red-600">{errors[n]?.message}</p>;

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        setServerError("");
        const r = initial ? await updateInvoice(initial.id, values) : await createInvoice(values);
        if ("error" in r) return setServerError(r.error);
        if (!initial) reset();
        onDone?.();
        router.refresh();
      })}
      className="space-y-4"
    >
      <div>
        <label className={label}>Student</label>
        <select {...register("userId")} className={input}>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name ?? s.email} — {s.email}
            </option>
          ))}
        </select>
        {err("userId")}
      </div>

      <div>
        <label className={label}>Batch (optional)</label>
        <select {...register("batchId")} className={input}>
          <option value="">— none —</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.code})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label}>Description</label>
        <input {...register("description")} placeholder="Course fee — Full Stack Development" className={input} />
        {err("description")}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={label}>Amount</label>
          <input type="number" min={0} {...register("amount")} className={input} />
          {err("amount")}
        </div>
        <div>
          <label className={label}>Discount</label>
          <input type="number" min={0} {...register("discount")} className={input} />
          {err("discount")}
        </div>
        <div>
          <label className={label}>Paid now</label>
          <input type="number" min={0} {...register("paidAmount")} className={input} />
          {err("paidAmount")}
        </div>
      </div>

      <p className="rounded-xl bg-gray-50 px-4 py-2.5 text-sm">
        Total payable <strong className="font-semibold text-gray-900">{npr(total)}</strong>
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label}>Issued</label>
          <input type="date" {...register("issuedAt")} className={input} />
        </div>
        <div>
          <label className={label}>Due</label>
          <input type="date" {...register("dueAt")} className={input} />
        </div>
      </div>

      <div>
        <label className={label}>Payment method</label>
        <input {...register("method")} placeholder="Cash / eSewa / Bank" className={input} />
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting || students.length === 0}
        className="w-full rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {isSubmitting ? "Generating…" : "Generate bill"}
      </button>
    </form>
  );
}

export function InvoiceActions({
  id,
  outstanding,
  cancelled,
}: {
  id: string;
  outstanding: number;
  cancelled: boolean;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (cancelled) return <span className="text-xs text-gray-400">Cancelled</span>;
  if (outstanding <= 0) return <span className="text-xs text-teal-600">Settled</span>;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number" min={1} max={outstanding} value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={String(outstanding)}
        className="w-24 rounded-lg bg-gray-50 px-2 py-1 text-sm ring-1 ring-gray-950/5"
      />
      <input
        value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Method"
        className="w-24 rounded-lg bg-gray-50 px-2 py-1 text-sm ring-1 ring-gray-950/5"
      />
      <button
        type="button" disabled={pending || !amount}
        onClick={() =>
          start(async () => {
            setError("");
            const r = await recordPayment(id, Number(amount), method);
            if ("error" in r) return setError(r.error);
            setAmount(""); setMethod(""); router.refresh();
          })
        }
        className="rounded-lg bg-teal-600 px-3 py-1 text-sm font-medium text-white disabled:opacity-60"
      >
        Record
      </button>
      <button
        type="button" disabled={pending}
        onClick={() => start(async () => { await cancelInvoice(id); router.refresh(); })}
        className="text-xs text-gray-400 hover:text-red-600"
      >
        Cancel
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function EditInvoice({
  invoice,
  students,
  batches,
}: {
  invoice: InvoiceFormValues & { id: string; invoiceNo: string };
  students: { id: string; name: string | null; email: string }[];
  batches: { id: string; name: string; code: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-teal-600 hover:text-teal-700"
      >
        Edit
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-gray-950/40 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="my-8 w-full max-w-md rounded-2xl bg-white p-6 ring-1 ring-gray-950/5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Edit {invoice.invoiceNo}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Close
              </button>
            </div>
            <NewInvoice
              students={students}
              batches={batches}
              initial={invoice}
              onDone={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

/** Only offered while nothing has been paid - see deleteInvoice. */
export function DeleteInvoice({ id, invoiceNo }: { id: string; invoiceNo: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <>
      <button
        type="button"
        aria-label={`Delete ${invoiceNo}`}
        title={error || "Delete invoice"}
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete ${invoiceNo}? Use Cancel instead if this was a real invoice.`)) return;
          start(async () => {
            const r = await deleteInvoice(id);
            if ("error" in r) return setError(r.error);
            router.refresh();
          });
        }}
        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 size={15} />
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </>
  );
}
