"use server";

import { revalidatePath } from "next/cache";
import { Expense } from "@/db";
import { getSession } from "@/lib/auth";
import { Role } from "@/lib/types";
import { expenseSchema, parseInput } from "@/lib/schemas";

type Result = { success: true } | { error: string };

export async function createExpense(data: unknown): Promise<Result> {
  const session = await getSession();
  if (!session || session.user.role !== Role.ADMIN) return { error: "Unauthorized" };

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
  const session = await getSession();
  if (!session || session.user.role !== Role.ADMIN) return { error: "Unauthorized" };
  await Expense.destroy({ where: { id } });
  revalidatePath("/admin/expenses");
  return { success: true };
}

export async function updateExpense(id: string, data: unknown): Promise<Result> {
  const session = await getSession();
  if (!session || session.user.role !== Role.ADMIN) return { error: "Unauthorized" };

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
