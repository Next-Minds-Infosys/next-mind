import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center ring-1 ring-gray-950/5">
        <p className="font-mono text-sm text-teal-600">404</p>
        <h1 className="mt-2 text-xl font-semibold text-gray-900">Page not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          That link may be out of date, or the page has moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href="/"
            className="rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white"
          >
            Go home
          </Link>
          <Link
            href="/courses"
            className="rounded-full px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Browse courses
          </Link>
        </div>
      </div>
    </div>
  );
}
