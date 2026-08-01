"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deletePolicy } from "./actions";

export function PolicyRowActions({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/policies/${id}/edit`}
        className="text-sm font-medium text-teal-600 hover:text-teal-700"
      >
        Edit
      </Link>
      <button
        type="button"
        aria-label={`Delete ${label}`}
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete “${label}”? This cannot be undone.`)) return;
          start(async () => {
            const r = await deletePolicy(id);
            if (r && "error" in r) {
              alert(r.error);
              return;
            }
            router.refresh();
          });
        }}
        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
