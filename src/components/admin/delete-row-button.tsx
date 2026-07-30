"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

/**
 * Delete control for the lead tables (contacts, enrollments, enterprise
 * inquiries). They share a shape - one row, one id, no dependants - so they
 * share one button rather than three near-identical copies.
 *
 * `action` is a server action passed down from the server component; Next
 * serialises it as a reference, so the client never learns what it does.
 */
export function DeleteRow({
  id,
  label,
  action,
}: {
  id: string;
  /** Identifies the row in the confirm prompt, e.g. the sender's name. */
  label: string;
  action: (id: string) => Promise<{ success: true } | { error: string }>;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-col items-start">
      <button
        type="button"
        aria-label={`Delete ${label}`}
        title={error || `Delete ${label}`}
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete the record from ${label}? This cannot be undone.`)) return;
          setError("");
          start(async () => {
            const r = await action(id);
            if ("error" in r) return setError(r.error);
            router.refresh();
          });
        }}
        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 size={15} />
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
