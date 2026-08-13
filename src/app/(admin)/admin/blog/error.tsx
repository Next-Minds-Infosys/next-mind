"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { Loader2, TriangleAlert } from "lucide-react";

/** Scoped to /admin/blog/* so a post-loading or save failure doesn't blank the whole dashboard. */
export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    console.error("[admin/blog] unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center ring-1 ring-gray-950/5">
        <TriangleAlert size={36} aria-hidden="true" className="mx-auto mb-3 text-amber-600" />
        <h1 className="text-xl font-semibold text-gray-900">Couldn&apos;t load the blog</h1>
        <p className="mt-2 text-sm text-gray-500">
          Something went wrong loading this page. Try again, and if it keeps happening let us know.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-gray-400">Reference: {error.digest}</p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => reset())}
            className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending && <Loader2 size={16} className="animate-spin" />}
            Try again
          </button>
          <Link
            href="/admin/blog"
            className="rounded-full px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Back to posts
          </Link>
        </div>
      </div>
    </div>
  );
}
