"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle, Pencil, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { FileUpload, type UploadedFile } from "@/components/lms/file-upload";
import { ScreenRecorder } from "@/components/lms/screen-recorder";
import { relativeTime } from "@/components/lms/ui";
import { deleteLesson, updateLesson } from "../../actions";

export interface EditableLesson {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  videoKey: string | null;
  videoMime: string | null;
  videoSizeBytes: number | null;
  published: boolean;
  createdAt: string;
  /** Shown in the delete confirmation - both cascade away with the lesson. */
  materialCount: number;
  completionCount: number;
}

const input =
  "w-full rounded-lg border border-nm-border px-3 py-2 text-sm text-nm-navy outline-none focus:border-nm-teal";

export function LessonRow({ batchId, lesson }: { batchId: string; lesson: EditableLesson }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description ?? "");
  const [orderIndex, setOrderIndex] = useState(String(lesson.orderIndex));
  const [published, setPublished] = useState(lesson.published);
  // Seeded from the saved row so "no change" round-trips the existing video
  // rather than clearing it. fileName is cosmetic and not stored on Lesson.
  const [video, setVideo] = useState<UploadedFile | null>(
    lesson.videoKey
      ? {
          key: lesson.videoKey,
          fileName: "current video",
          contentType: lesson.videoMime ?? "",
          size: lesson.videoSizeBytes ?? 0,
        }
      : null,
  );
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function reset() {
    setTitle(lesson.title);
    setDescription(lesson.description ?? "");
    setOrderIndex(String(lesson.orderIndex));
    setPublished(lesson.published);
    setVideo(
      lesson.videoKey
        ? {
            key: lesson.videoKey,
            fileName: "current video",
            contentType: lesson.videoMime ?? "",
            size: lesson.videoSizeBytes ?? 0,
          }
        : null,
    );
    setError("");
    setEditing(false);
  }

  function save() {
    setError("");
    startTransition(async () => {
      const r = await updateLesson(batchId, lesson.id, {
        title,
        description,
        orderIndex,
        videoKey: video?.key ?? "",
        videoMime: video?.contentType ?? "",
        videoSizeBytes: video?.size,
        published,
      });
      if ("error" in r) {
        setError(r.error);
        return;
      }
      setEditing(false);
      // The lesson list is rendered by a Server Component; without this the row
      // keeps showing the pre-edit values until the next navigation.
      router.refresh();
    });
  }

  if (!editing) {
    return (
      <li className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <PlayCircle size={17} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-nm-navy">{lesson.title}</p>
          {lesson.description && <p className="mt-0.5 text-sm text-nm-muted">{lesson.description}</p>}
          <p className="mt-1 text-xs text-nm-muted">
            {lesson.videoKey ? "Video attached" : "No video"} · {relativeTime(new Date(lesson.createdAt))}
            {lesson.completionCount > 0 && ` · ${lesson.completionCount} completed`}
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              lesson.published ? "bg-teal-50 text-teal-700" : "bg-nm-surface text-nm-muted"
            }`}
          >
            {lesson.published ? "Published" : "Draft"}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Edit ${lesson.title}`}
            className="rounded-lg border border-nm-border p-2 text-nm-muted transition-colors hover:bg-nm-surface hover:text-nm-navy"
          >
            <Pencil size={15} aria-hidden="true" />
          </button>
          <ConfirmDeleteDialog
            trigger={
              <button
                type="button"
                aria-label={`Delete ${lesson.title}`}
                className="rounded-lg border border-nm-border p-2 text-nm-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            }
            title={`Delete "${lesson.title}"?`}
            description={buildDeleteWarning(lesson)}
            onConfirm={async () => {
              const r = await deleteLesson(batchId, lesson.id);
              if (!("error" in r)) router.refresh();
              return r;
            }}
          />
        </div>
      </li>
    );
  }

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="space-y-3 rounded-xl border border-nm-border p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lesson title"
          className={input}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className={input}
        />
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-nm-muted">
            Order
            <input
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
              inputMode="numeric"
              className="w-20 rounded-lg border border-nm-border px-2 py-1.5 text-sm text-nm-navy outline-none focus:border-nm-teal"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-nm-muted">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-teal-600"
            />
            Visible to students
          </label>
        </div>

        <div className="rounded-lg border border-dashed border-nm-border p-3">
          <p className="mb-2 text-xs font-semibold text-nm-muted">
            {video ? "Video attached — upload a new file to replace it" : "No video attached"}
          </p>
          <FileUpload
            resourceId={batchId}
            scope="lesson"
            accept="video/mp4,video/webm"
            label={video ? "Replace video" : "Upload video"}
            onUploaded={setVideo}
          />
          <div className="my-2 flex items-center gap-3">
            <span className="h-px flex-1 bg-nm-border" />
            <span className="text-xs font-medium text-nm-muted">or record a new one</span>
            <span className="h-px flex-1 bg-nm-border" />
          </div>
          <ScreenRecorder resourceId={batchId} scope="lesson" onUploaded={setVideo} />
          {video && (
            <button
              type="button"
              onClick={() => setVideo(null)}
              className="mt-2 text-xs font-semibold text-red-600 hover:underline"
            >
              Remove video
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={pending}
            className="rounded-lg border border-nm-border px-4 py-2 text-sm font-semibold text-nm-navy"
          >
            Cancel
          </button>
        </div>
      </div>
    </li>
  );
}

/** Names what else disappears, because both relations cascade. */
function buildDeleteWarning(l: EditableLesson) {
  const also: string[] = [];
  if (l.materialCount > 0) also.push(`${l.materialCount} attached file${l.materialCount === 1 ? "" : "s"}`);
  if (l.completionCount > 0)
    also.push(`${l.completionCount} student completion record${l.completionCount === 1 ? "" : "s"}`);

  const base = l.published
    ? "This lesson is live — students will lose access immediately."
    : "This lesson is a draft, so students cannot see it yet.";

  return also.length > 0
    ? `${base} Deleting it also removes ${also.join(" and ")}. This cannot be undone.`
    : `${base} This cannot be undone.`;
}
