"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Root error boundary. Without one, an unhandled server error renders Next's
 * unstyled default page - which also leaks a stack trace shape to visitors.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center ring-1 ring-gray-950/5">
        <div className="mb-3 text-4xl">⚠️</div>
        <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-500">
          The page could not be loaded. Try again, and if it keeps happening let us know.
        </p>
        {/* The digest is the only safe identifier to surface - it maps to the
            server log entry without exposing the message itself. */}
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-gray-400">Reference: {error.digest}</p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
