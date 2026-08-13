import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors post-editor.tsx's layout, shown while /admin/blog/new or /admin/blog/[id]/edit load. */
export function PostEditorSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-6 w-40" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-gray-950/5">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>

        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-gray-950/5">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 rounded-lg" />
              <Skeleton className="h-9 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
