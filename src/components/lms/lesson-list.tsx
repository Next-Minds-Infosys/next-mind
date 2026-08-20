"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Lock, PlayCircle } from "lucide-react";
import { VideoPlayer } from "@/components/lms/video-player";
import { setLessonComplete } from "@/app/(student)/student/actions";

export interface LessonItem {
  id: string;
  title: string;
  description: string | null;
  videoKey: string | null;
  done: boolean;
}

/** Watched this far and the lesson counts as finished. */
const COMPLETE_AT = 0.9;

/**
 * Compact lesson list.
 *
 * A batch can run to dozens of lessons, and the previous layout rendered every
 * <video> inline - forty players mounted at once, each opening a presigned
 * media request on load. Here the list is a set of one-line rows and only the
 * open lesson mounts a player, so a long batch costs one video, not forty.
 *
 * Completion is earned rather than clicked: the control stays locked until 90%
 * of the video has actually played, measured from forward playback only, so
 * dragging the scrubber to the end does not mark it done. Lessons with no video
 * can still be marked manually - there is nothing to watch.
 */
export function LessonList({
  lessons,
  watermark,
}: {
  lessons: LessonItem[];
  watermark: string;
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [doneIds, setDoneIds] = useState<Set<string>>(
    () => new Set(lessons.filter((l) => l.done).map((l) => l.id)),
  );
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [, start] = useTransition();

  const markDone = (id: string) => {
    if (doneIds.has(id)) return;
    setDoneIds((prev) => new Set(prev).add(id));
    start(async () => {
      const r = await setLessonComplete(id, true);
      if ("error" in r) {
        setDoneIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
      router.refresh();
    });
  };

  return (
    <ul className="divide-y divide-nm-border">
      {lessons.map((l, i) => {
        const open = openId === l.id;
        const done = doneIds.has(l.id);
        const watched = progress[l.id] ?? 0;
        const unlocked = !l.videoKey || watched >= COMPLETE_AT;

        return (
          <li key={l.id} className="first:-mt-2 last:-mb-2">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : l.id)}
              aria-expanded={open}
              className="flex w-full items-center gap-4 py-4 text-left"
            >
              <span
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                  done ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-700"
                }`}
              >
                {done ? <Check size={16} strokeWidth={3} /> : i + 1}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-nm-navy">{l.title}</span>
                {l.description && (
                  <span className="mt-0.5 block truncate text-sm text-nm-muted">
                    {l.description}
                  </span>
                )}
              </span>

              <span className="flex flex-shrink-0 items-center gap-3">
                {done ? (
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    Completed
                  </span>
                ) : (
                  <span className="hidden items-center gap-1.5 text-xs font-medium text-nm-muted sm:inline-flex">
                    <PlayCircle size={14} aria-hidden="true" />
                    {l.videoKey ? "Watch" : "No video"}
                  </span>
                )}
                <ChevronDown
                  size={18}
                  className="text-nm-muted transition-transform"
                  style={{ transform: open ? "rotate(180deg)" : undefined }}
                  aria-hidden="true"
                />
              </span>
            </button>

            {open && (
              <div className="pb-5">
                {l.description && (
                  <p className="mb-3 text-sm leading-relaxed text-nm-body">{l.description}</p>
                )}

                {l.videoKey ? (
                  <VideoPlayer
                    src={`/api/media/${l.videoKey}`}
                    watermark={watermark}
                    onWatchedFraction={(f) => {
                      setProgress((prev) =>
                        f > (prev[l.id] ?? 0) ? { ...prev, [l.id]: f } : prev,
                      );
                      if (f >= COMPLETE_AT) markDone(l.id);
                    }}
                  />
                ) : (
                  <p className="rounded-xl border border-nm-border bg-nm-surface px-4 py-6 text-center text-sm text-nm-muted">
                    Video not uploaded yet.
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between gap-3">
                  {done ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                      <Check size={13} strokeWidth={3} />
                      Completed
                    </span>
                  ) : unlocked ? (
                    <button
                      type="button"
                      onClick={() => markDone(l.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-nm-surface px-3 py-1.5 text-xs font-semibold text-nm-navy transition-colors hover:bg-nm-border/60"
                    >
                      <span className="h-4 w-4 rounded-full border border-nm-muted" />
                      Mark complete
                    </button>
                  ) : (
                    <span
                      className="inline-flex items-center gap-2 rounded-full bg-nm-surface px-3 py-1.5 text-xs font-medium text-nm-muted"
                      title="Finish the video to complete this lesson"
                    >
                      <Lock size={13} aria-hidden="true" />
                      Watch to complete
                    </span>
                  )}

                  {l.videoKey && !done && (
                    <span className="text-xs tabular-nums text-nm-muted">
                      {Math.round(watched * 100)}% watched
                    </span>
                  )}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
