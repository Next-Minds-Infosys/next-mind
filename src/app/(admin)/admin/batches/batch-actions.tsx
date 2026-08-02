"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { BatchInput } from "@/lib/schemas";
import { BatchForm } from "./batch-form";
import { batchImpact, deleteBatch } from "./actions";

interface Props {
  batch: BatchInput & { id: string; name: string };
  courses: { id: string; title: string }[];
  instructors: { id: string; name: string | null; email: string }[];
}

type Impact = Awaited<ReturnType<typeof batchImpact>>;

export function BatchRowActions({ batch, courses, instructors }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [impact, setImpact] = useState<Impact | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const lines =
    impact && !("error" in impact)
      ? ([
          ["students", impact.students],
          ["lessons", impact.lessons],
          ["materials", impact.materials],
          ["assignments", impact.assignments],
          ["messages", impact.messages],
        ] as const).filter(([, n]) => n > 0)
      : [];

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          Edit
        </button>
        <button
          type="button"
          aria-label={`Delete ${batch.name}`}
          disabled={pending}
          onClick={() => {
            setError("");
            start(async () => setImpact(await batchImpact(batch.id)));
          }}
          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {editing && (
        <Modal title={`Edit ${batch.name}`} onClose={() => setEditing(false)}>
          <BatchForm
            courses={courses}
            instructors={instructors}
            initial={batch}
            onDone={() => {
              setEditing(false);
              router.refresh();
            }}
          />
        </Modal>
      )}

      {impact && (
        <Modal title={`Delete ${batch.name}?`} onClose={() => setImpact(null)}>
          {"error" in impact ? (
            <p className="text-sm text-red-600">{impact.error}</p>
          ) : (
            <>
              {lines.length > 0 ? (
                <>
                  <p className="text-sm text-gray-700">
                    This permanently deletes the batch and everything inside it:
                  </p>
                  <ul className="my-3 space-y-1 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    {lines.map(([label, n]) => (
                      <li key={label}>
                        <strong className="tabular-nums">{n}</strong> {label}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-gray-700">
                  This batch is empty. Deleting it removes nothing else.
                </p>
              )}
              {impact.invoices > 0 && (
                <p className="mb-3 text-sm text-amber-700">
                  {impact.invoices} invoice{impact.invoices === 1 ? "" : "s"} will be kept but will
                  no longer be linked to a batch.
                </p>
              )}
              <p className="mb-4 text-sm text-gray-500">This cannot be undone.</p>
              {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const r = await deleteBatch(batch.id);
                      if ("error" in r) return setError(r.error);
                      setImpact(null);
                      router.refresh();
                    })
                  }
                  className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {pending ? "Deleting…" : "Delete batch"}
                </button>
                <button
                  type="button"
                  onClick={() => setImpact(null)}
                  className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-gray-950/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 ring-1 ring-gray-950/5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
