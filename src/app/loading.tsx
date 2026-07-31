/**
 * Every page in this app is dynamic and queries Postgres, so navigation blocked
 * on a blank screen until the server responded. This streams a skeleton
 * immediately instead.
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
