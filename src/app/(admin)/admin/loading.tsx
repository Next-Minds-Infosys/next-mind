/**
 * Skeleton for the authenticated portals only.
 *
 * This used to live at src/app/loading.tsx, which wrapped EVERY route in a
 * Suspense boundary. That flushed the response - and with it a 200 status -
 * before the page resolved, so notFound() on /blog/[slug] and
 * /courses/[courseId] could only swap the body: a soft 404 that search engines
 * index as a real page. Public routes now get their status right; the portals
 * keep the skeleton, where perceived speed matters and the pages are noindex.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6" role="status" aria-label="Loading">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-8 w-1/3 rounded-lg bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-200" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-gray-200" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
