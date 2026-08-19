"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export interface UploadedFile {
  key: string;
  fileName: string;
  contentType: string;
  size: number;
}

export type UploadScope =
  | "lesson"
  | "material"
  | "assignment"
  | "submission"
  | "courseImage"
  | "mentorPhoto"
  | "postCover"
  | "postImage"
  | "avatar";

/**
 * Two-step direct upload: ask our server to presign a PUT, then send the bytes
 * straight to S3. The file never passes through a Next route handler, which
 * would cap out at Vercel's ~4.5 MB request body limit.
 *
 * Exported so the screen recorder can push its blob through exactly this path
 * rather than growing a second, subtly different uploader.
 */
export async function uploadToS3({
  file,
  resourceId,
  scope,
  onProgress,
}: {
  file: File;
  resourceId: string;
  scope: UploadScope;
  onProgress?: (percent: number) => void;
}): Promise<UploadedFile> {
  // The upload allowlist matches the bare type, so a MediaRecorder blob typed
  // `video/webm;codecs=vp9,opus` has to have its codec parameter dropped here.
  const contentType = (file.type || "application/octet-stream").split(";")[0].trim();

  const res = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resourceId,
      scope,
      filename: file.name,
      contentType,
      sizeBytes: file.size,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Could not start the upload.");

  // XHR rather than fetch: fetch cannot report upload progress, and these are
  // large files where a silent wait is a bad experience.
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", data.url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) =>
      e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Upload failed — check your connection."));
    xhr.send(file);
  });

  return { key: data.key, fileName: file.name, contentType, size: file.size };
}

export function FileUpload({
  resourceId,
  scope,
  accept,
  label = "Choose file",
  onUploaded,
}: {
  /** Batch id for batch-scoped uploads, course/mentor id for the admin-only scopes, own user id for "avatar". */
  resourceId: string;
  scope: UploadScope;
  accept?: string;
  label?: string;
  onUploaded: (file: UploadedFile) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function handle(file: File) {
    setError("");
    setProgress(0);
    try {
      const uploaded = await uploadToS3({ file, resourceId, scope, onProgress: setProgress });
      onUploaded(uploaded);
      setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      setProgress(null);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-gray-950/5 hover:bg-gray-100"
      >
        <UploadCloud size={16} />
        {label}
      </button>

      {progress !== null && (
        <div className="mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {progress === 100 ? "Uploaded" : `Uploading… ${progress}%`}
          </p>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
