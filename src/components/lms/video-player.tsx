"use client";

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
export function VideoPlayer({ src, watermark }: { src: string; watermark: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-black">
      <video
        src={src}
        controls
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        className="aspect-video w-full"
      />
      <span className="pointer-events-none absolute right-3 top-3 select-none rounded bg-black/40 px-2 py-1 text-[11px] font-medium text-white/70">
        {watermark}
      </span>
    </div>
  );
}
