"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUpload, type UploadedFile } from "@/components/lms/file-upload";
import { replyToMessage, submitAssignment } from "../../actions";

const input =
  "w-full rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500";

export function SubmitAssignment({
  batchId,
  assignmentId,
  locked,
  hasSubmitted,
}: {
  batchId: string;
  assignmentId: string;
  locked: boolean;
  hasSubmitted: boolean;
}) {
  const router = useRouter();
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (locked) {
    return <p className="mt-2 text-xs text-gray-500">Graded — no further changes.</p>;
  }

  return (
    <div className="mt-3 space-y-2">
      <FileUpload
        batchId={batchId}
        scope="submission"
        label={file ? `Replace (${file.fileName})` : "Attach your work"}
        onUploaded={setFile}
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="A note for your instructor (optional)"
        className={input}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="button"
        disabled={pending || (!file && !note.trim())}
        className="rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        onClick={() =>
          start(async () => {
            setError("");
            const r = await submitAssignment({
              assignmentId,
              storageKey: file?.key ?? "",
              fileName: file?.fileName ?? "",
              note,
            });
            if ("error" in r) return setError(r.error);
            setFile(null);
            setNote("");
            router.refresh();
          })
        }
      >
        {pending ? "Submitting…" : hasSubmitted ? "Resubmit" : "Submit"}
      </button>
    </div>
  );
}

export function Reply({ batchId, parentId }: { batchId: string; parentId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-xs font-medium text-teal-600 hover:text-teal-700"
      >
        Reply
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        placeholder="Your reply…"
        className={input}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending || !body.trim()}
          className="rounded-full bg-teal-600 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
          onClick={() =>
            start(async () => {
              setError("");
              const r = await replyToMessage({ batchId, body, parentId });
              if ("error" in r) return setError(r.error);
              setBody("");
              setOpen(false);
              router.refresh();
            })
          }
        >
          {pending ? "Sending…" : "Send"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
