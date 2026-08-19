"use client";

import { useRef } from "react";

/**
 * Watch-only player.
 *
 * `src` points at /api/media/... which checks batch membership and then
 * redirects to a short-lived presigned URL. controlsList/contextMenu remove the
 * obvious save paths and the watermark attributes the stream to a viewer.
 *
 * None of this is real protection - see .planning/lms-expansion-plan.md §2.
 * Within the URL's lifetime the object is still fetchable, and screen recording
 * defeats every tier including commercial DRM.
 */
export function VideoPlayer({
  src,
  watermark,
  onWatchedFraction,
}: {
  src: string;
  watermark: string;
  /**
   * Fraction of the video actually played back, 0-1. Only advances while time
   * moves forward in playback-sized steps, so dragging the scrubber to the end
   * does not count as having watched it.
   */
  onWatchedFraction?: (fraction: number) => void;
}) {
  const watched = useRef(0);
  const lastTime = useRef(0);

  return (
    <div className="relative overflow-hidden rounded-xl bg-black">
      <video
        src={src}
        controls
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        onSeeked={(e) => {
          lastTime.current = e.currentTarget.currentTime;
        }}
        onTimeUpdate={(e) => {
          if (!onWatchedFraction) return;
          const v = e.currentTarget;
          const delta = v.currentTime - lastTime.current;
          lastTime.current = v.currentTime;
          // A normal timeupdate tick is ~0.25s. Anything larger is a seek.
          if (delta > 0 && delta < 1.5) watched.current += delta;
          if (v.duration > 0) {
            onWatchedFraction(Math.min(1, watched.current / v.duration));
          }
        }}
        className="aspect-video w-full"
      />
      <span className="pointer-events-none absolute right-3 top-3 select-none rounded bg-black/40 px-2 py-1 text-[11px] font-medium text-white/70">
        {watermark}
      </span>
    </div>
  );
}
