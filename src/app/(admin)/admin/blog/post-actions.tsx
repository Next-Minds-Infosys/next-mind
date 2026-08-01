"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deletePost } from "./actions";

export function PostRowActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/blog/${id}/edit`}
        className="text-sm font-medium text-teal-600 hover:text-teal-700"
      >
        Edit
      </Link>
      <button
        type="button"
        aria-label={`Delete ${title}`}
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete “${title}”? This cannot be undone.`)) return;
          start(async () => {
            await deletePost(id);
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
