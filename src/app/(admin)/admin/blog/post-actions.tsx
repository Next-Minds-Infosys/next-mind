"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { PostInput } from "@/lib/schemas";
import { PostForm } from "./post-form";
import { deletePost } from "./actions";

export function PostRowActions({ post }: { post: PostInput & { id: string } }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

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
          aria-label={`Delete ${post.title}`}
          disabled={pending}
          onClick={() => {
            if (!confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
            start(async () => {
              await deletePost(post.id);
              router.refresh();
            });
          }}
          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-gray-950/40 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setEditing(false)}
        >
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 ring-1 ring-gray-950/5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Edit post</h2>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Close
              </button>
            </div>
            <PostForm initial={post} onDone={() => setEditing(false)} />
          </div>
        </div>
      )}
    </>
  );
}
