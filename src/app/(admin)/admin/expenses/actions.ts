"use server";

import { revalidatePath } from "next/cache";
import { Expense } from "@/db";
import { expenseSchema, parseInput } from "@/lib/schemas";
import { RESOURCES } from "@/lib/policies";
import { sessionCan } from "@/lib/access";

type Result = { success: true } | { error: string };

export async function createExpense(data: unknown): Promise<Result> {
  const { session, allowed } = await sessionCan(RESOURCES.EXPENSES, "create");
  if (!session || !allowed) return { error: "Unauthorized" };

  const parsed = parseInput(expenseSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const d = parsed.data;

  await Expense.create({
    title: d.title,
    category: d.category,
    amount: d.amount,
    vendor: d.vendor || null,
    spentAt: d.spentAt,
    note: d.note || null,
    receiptKey: d.receiptKey || null,
    receiptName: d.receiptName || null,
    createdById: session.user.id,
  });

  revalidatePath("/admin/expenses");
  return { success: true };
}

export async function deleteExpense(id: string): Promise<Result> {
  const { allowed } = await sessionCan(RESOURCES.EXPENSES, "delete");
  if (!allowed) return { error: "Unauthorized" };
  await Expense.destroy({ where: { id } });
  revalidatePath("/admin/expenses");
  return { success: true };
}

export async function updateExpense(id: string, data: unknown): Promise<Result> {
  const { allowed } = await sessionCan(RESOURCES.EXPENSES, "update");
  if (!allowed) return { error: "Unauthorized" };

  const parsed = parseInput(expenseSchema, data);
  if (!parsed.success) return { error: parsed.error };
  const d = parsed.data;

  const expense = await Expense.findByPk(id);
  if (!expense) return { error: "Expense not found." };

  // createdById is deliberately not touched - it records who filed the expense,
  // not who last corrected a typo in it.
  await expense.update({
    title: d.title,
    category: d.category,
    amount: d.amount,
    vendor: d.vendor || null,
    spentAt: d.spentAt,
    note: d.note || null,
    receiptKey: d.receiptKey || null,
    receiptName: d.receiptName || null,
  });

  revalidatePath("/admin/expenses");
  return { success: true };
}
