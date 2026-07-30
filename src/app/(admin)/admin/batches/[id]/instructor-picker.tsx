"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignInstructor } from "../actions";

/**
 * Standalone teacher assignment.
 *
 * The batch form can also set this, but it means saving every field at once —
 * easy to miss, and easy to overwrite something by accident. This does the one
 * thing.
 */
export function InstructorPicker({
  batchId,
  current,
  instructors,
}: {
  batchId: string;
  current: string | null;
  instructors: { id: string; name: string | null; email: string }[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(current ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div>
      <label className="text-sm font-medium text-gray-700" htmlFor="batch-instructor">
        Instructor
      </label>
      <div className="mt-1 flex flex-wrap gap-2">
        <select
          id="batch-instructor"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
            setError("");
          }}
          className="min-w-[12rem] flex-1 rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">— unassigned —</option>
          {instructors.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name ?? i.email}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={pending || value === (current ?? "")}
          onClick={() =>
            start(async () => {
              const r = await assignInstructor(batchId, value);
              if ("error" in r) return setError(r.error);
              setSaved(true);
              router.refresh();
            })
          }
          className="rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Assign"}
        </button>
      </div>
      {instructors.length === 0 && (
        <p className="mt-2 text-xs text-amber-700">
          No instructors yet — create one under Users, with the role set to Instructor.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {saved && !error && <p className="mt-2 text-sm text-teal-700">Instructor updated.</p>}
    </div>
  );
}
