"use client";

/**
 * Mobile sticky action bar (spec §5.5).
 *
 * On a phone the price and the enrol button sit far above the fold once the
 * visitor starts reading the curriculum, so the decision and the action get
 * separated by several screens of scrolling. This keeps both a thumb away.
 *
 * Hidden at `md` and up, where the sidebar card already does the job.
 */
export function CourseStickyBar({
  price,
  nextBatch,
  onEnroll,
}: {
  price: number;
  /** Only rendered when a real date exists - never a placeholder. */
  nextBatch?: string | null;
  onEnroll: () => void;
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-nm-border bg-white/95 backdrop-blur-md md:hidden"
      // Keeps the bar clear of the iOS home indicator.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <p className="font-display text-lg font-bold leading-tight text-nm-navy">
            NPR {price.toLocaleString()}
          </p>
          {nextBatch ? (
            <p className="truncate text-xs font-medium text-warning">Next batch {nextBatch}</p>
          ) : (
            <p className="truncate text-xs text-nm-muted">Online &amp; on campus</p>
          )}
        </div>
        <button
          type="button"
          onClick={onEnroll}
          className="nm-gradient min-h-[48px] shrink-0 rounded-xl px-7 text-sm font-bold text-white transition-transform active:scale-95"
        >
          Enroll now
        </button>
      </div>
    </div>
  );
}
