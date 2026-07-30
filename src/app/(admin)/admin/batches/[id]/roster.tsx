"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { addStudentById, removeStudentFromBatch } from "../actions";

interface Row {
  membershipId: string;
  name: string | null;
  email: string;
  enrolledAt: string;
}

interface Candidate {
  id: string;
  name: string | null;
  email: string;
}

/**
 * Batch roster.
 *
 * Accounts are created in Users; this only ever picks from registered students,
 * so a typo cannot silently mint a new account. `candidates` arrives already
 * filtered to STUDENT accounts that are not on this roster.
 */
export function Roster({
  batchId,
  students,
  candidates,
  full,
}: {
  batchId: string;
  students: Row[];
  candidates: Candidate[];
  full: boolean;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {full ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This batch is at capacity. Raise the capacity under Details to add more students.
        </p>
      ) : candidates.length === 0 ? (
        <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No registered students left to add.{" "}
          <Link href="/admin/users" className="font-medium text-teal-600 hover:text-teal-700">
            Create one under Users
          </Link>{" "}
          with the role set to Student.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            startTransition(async () => {
              const result = await addStudentById(batchId, userId);
              if ("error" in result) return setError(result.error);
              setUserId("");
              router.refresh();
            });
          }}
          className="flex flex-wrap gap-2"
        >
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="min-w-[12rem] flex-1 rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select a registered student…</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name ? `${c.name} — ${c.email}` : c.email}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={pending || !userId}
            className="rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Adding…" : "Add to batch"}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {students.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">No students in this batch yet.</p>
      ) : (
        <ul className="divide-y divide-gray-950/5">
          {students.map((s) => (
            <li key={s.membershipId} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{s.name ?? s.email}</p>
                <p className="truncate text-xs text-gray-500">{s.email}</p>
              </div>
              <button
                type="button"
                aria-label={`Remove ${s.email}`}
                disabled={pending}
                onClick={() => {
                  if (!confirm(`Remove ${s.email} from this batch?`)) return;
                  setError("");
                  startTransition(async () => {
                    const r = await removeStudentFromBatch(s.membershipId, batchId);
                    if ("error" in r) return setError(r.error);
                    router.refresh();
                  });
                }}
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
