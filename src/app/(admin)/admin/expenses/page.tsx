import { Calendar, Tag, Wallet } from "lucide-react";
import { Expense } from "@/db";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteExpense, EditExpense, NewExpense } from "./expense-client";
import { EXPENSE_CATEGORIES, type ExpenseInput } from "@/lib/schemas";
import { requireResource } from "@/lib/access";
import { RESOURCES } from "@/lib/policies";

// The column is TEXT, so a row written before a category was retired (or edited
// straight in SQL) can hold a value the enum no longer accepts. Narrow it here
// rather than casting, so the form always opens on a valid option.
const asCategory = (v: string): ExpenseInput["category"] =>
  (EXPENSE_CATEGORIES as readonly string[]).includes(v)
    ? (v as ExpenseInput["category"])
    : "Other";

const RING = "ring-1 ring-gray-950/5";
const npr = (n: number) => `NPR ${n.toLocaleString("en-NP")}`;

export default async function ExpensesPage() {
  await requireResource(RESOURCES.EXPENSES);
  const expenses = await Expense.findAll({ order: [["spentAt", "DESC"]] });

  const total = expenses.reduce((n, e) => n + e.amount, 0);
  const thisMonthPrefix = new Date().toISOString().slice(0, 7);
  const thisMonth = expenses
    .filter((e) => String(e.spentAt).startsWith(thisMonthPrefix))
    .reduce((n, e) => n + e.amount, 0);

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
  const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const categoryTints = ["bg-violet-50 text-violet-600", "bg-rose-50 text-rose-600"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Office expenses</h1>
        <p className="mt-1 text-sm text-gray-500">What the institute spends, and on what.</p>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        <Card className={RING}>
          <CardContent className="p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Calendar size={18} />
            </span>
            <p className="mt-5 text-2xl font-semibold tabular-nums text-gray-900">{npr(thisMonth)}</p>
            <p className="mt-1 text-sm text-gray-500">This month</p>
          </CardContent>
        </Card>
        <Card className={RING}>
          <CardContent className="p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Wallet size={18} />
            </span>
            <p className="mt-5 text-2xl font-semibold tabular-nums text-gray-900">{npr(total)}</p>
            <p className="mt-1 text-sm text-gray-500">All time</p>
          </CardContent>
        </Card>
        {top.slice(0, 2).map(([cat, amt], i) => (
          <Card key={cat} className={RING}>
            <CardContent className="p-6">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${categoryTints[i]}`}
              >
                <Tag size={18} />
              </span>
              <p className="mt-5 text-2xl font-semibold tabular-nums text-gray-900">{npr(amt)}</p>
              <p className="mt-1 text-sm text-gray-500">{cat}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="whitespace-nowrap text-gray-500">{e.spentAt}</TableCell>
                  <TableCell>
                    <p className="font-medium text-gray-900">{e.title}</p>
                    {e.vendor && <p className="text-xs text-gray-500">{e.vendor}</p>}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                      {e.category}
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums">{npr(e.amount)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <EditExpense
                        expense={{
                          id: e.id,
                          title: e.title,
                          category: asCategory(e.category),
                          amount: e.amount,
                          vendor: e.vendor ?? "",
                          spentAt: e.spentAt,
                          note: e.note ?? "",
                          receiptKey: e.receiptKey ?? "",
                          receiptName: e.receiptName ?? "",
                        }}
                      />
                      <DeleteExpense id={e.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {expenses.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">Nothing recorded yet.</p>
          )}
        </div>

        <aside className={`h-fit rounded-2xl bg-white p-6 ${RING}`}>
          <h2 className="mb-4 font-semibold text-gray-900">Record an expense</h2>
          <NewExpense />
        </aside>
      </div>
    </div>
  );
}
