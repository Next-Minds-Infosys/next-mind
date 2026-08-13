"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import {
  EXPENSE_CATEGORIES,
  expenseSchema,
  type ExpenseFormValues,
  type ExpenseInput,
} from "@/lib/schemas";
import { createExpense, deleteExpense, updateExpense } from "./actions";

const input =
  "w-full rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500";
const label = "text-sm font-medium text-gray-700";

/**
 * Doubles as the edit form. Passing `initial` switches it to updateExpense and
 * keeps the fields populated - one form definition, so create and edit cannot
 * drift apart.
 */
export function NewExpense({
  initial,
  onDone,
}: {
  initial?: ExpenseFormValues & { id: string };
  onDone?: () => void;
} = {}) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues, unknown, ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initial ?? {
      title: "",
      category: "Other",
      amount: 0,
      vendor: "",
      spentAt: new Date().toISOString().slice(0, 10),
      note: "",
      receiptKey: "",
      receiptName: "",
    },
  });

  const err = (n: keyof ExpenseFormValues) =>
    errors[n] && <p className="mt-1 text-xs text-red-600">{errors[n]?.message}</p>;

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        setServerError("");
        const r = initial ? await updateExpense(initial.id, values) : await createExpense(values);
        if ("error" in r) return setServerError(r.error);
        if (!initial) reset();
        onDone?.();
        router.refresh();
      })}
      className="space-y-4"
    >
      <div>
        <label className={label}>What was it for</label>
        <input {...register("title")} placeholder="Office rent — Shrawan" className={input} />
        {err("title")}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label}>Category</label>
          <select {...register("category")} className={input}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Amount</label>
          <input type="number" min={0} {...register("amount")} className={input} />
          {err("amount")}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label}>Date</label>
          <input type="date" {...register("spentAt")} className={input} />
          {err("spentAt")}
        </div>
        <div>
          <label className={label}>Vendor</label>
          <input {...register("vendor")} placeholder="Optional" className={input} />
        </div>
      </div>
      <div>
        <label className={label}>Note</label>
        <textarea rows={2} {...register("note")} className={input} />
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving…
          </>
        ) : initial ? (
          "Save changes"
        ) : (
          "Record expense"
        )}
      </button>
    </form>
  );
}

export function DeleteExpense({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label="Delete expense"
      disabled={pending}
      onClick={() => start(async () => { await deleteExpense(id); router.refresh(); })}
      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
    </button>
  );
}

export function EditExpense({ expense }: { expense: ExpenseFormValues & { id: string } }) {
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
              <h2 className="font-semibold text-gray-900">Edit expense</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Close
              </button>
            </div>
            <NewExpense initial={expense} onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
