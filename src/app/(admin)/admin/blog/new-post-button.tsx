"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

export function NewPostButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => router.push("/admin/blog/new"))}
      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg disabled:opacity-60"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
      Add new post
    </button>
  );
}
