"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUpload, type UploadedFile } from "@/components/lms/file-upload";
import { createAssignment, createLesson, createMaterial, gradeSubmission, postMessage } from "../../actions";

const input =
  "w-full rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500";
const btn =
  "rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60";
const panel = "rounded-2xl bg-white p-6 ring-1 ring-gray-950/5";

function Err({ msg }: { msg: string }) {
  return msg ? <p className="mt-1 text-xs text-red-600">{msg}</p> : null;
}

export function AddLesson({ batchId }: { batchId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState<UploadedFile | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <div className={panel}>
      <h3 className="mb-4 font-semibold text-gray-900">Add a recorded lesson</h3>
      <div className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lesson title" className={input} />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What this covers (optional)" className={input} />
        <FileUpload
          resourceId={batchId}
          scope="lesson"
          accept="video/mp4,video/webm"
          label={video ? `Replace video (${video.fileName})` : "Upload video"}
          onUploaded={setVideo}
        />
        <p className="text-xs text-gray-500">
          Upload H.264/AAC MP4 — there is no transcoding step, so other codecs may not play in
          every browser.
        </p>
        <Err msg={error} />
        <button
          type="button"
          disabled={pending || !title || !video}
          className={btn}
          onClick={() =>
            start(async () => {
              setError("");
              const r = await createLesson(batchId, {
                title,
                description,
                orderIndex: 0,
                videoKey: video?.key ?? "",
                videoMime: video?.contentType ?? "",
                videoSizeBytes: video?.size,
                published: true,
              });
              if (r && "error" in r) return setError(r.error);
              setTitle(""); setDescription(""); setVideo(null);
              router.refresh();
            })
          }
        >
          {pending ? "Saving…" : "Publish lesson"}
        </button>
      </div>
    </div>
  );
}

export function AddMaterial({ batchId }: { batchId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <div className={panel}>
      <h3 className="mb-4 font-semibold text-gray-900">Share a file</h3>
      <div className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 1 slides" className={input} />
        <FileUpload
          resourceId={batchId}
          scope="material"
          label={file ? `Replace (${file.fileName})` : "Upload file"}
          onUploaded={setFile}
        />
        <Err msg={error} />
        <button
          type="button"
          disabled={pending || !title || !file}
          className={btn}
          onClick={() =>
            start(async () => {
              setError("");
              const r = await createMaterial(batchId, {
                title,
                storageKey: file?.key ?? "",
                fileName: file?.fileName ?? "",
                mimeType: file?.contentType ?? "",
                sizeBytes: file?.size,
                downloadable: true,
                lessonId: "",
              });
              if (r && "error" in r) return setError(r.error);
              setTitle(""); setFile(null);
              router.refresh();
            })
          }
        >
          {pending ? "Saving…" : "Share with batch"}
        </button>
      </div>
    </div>
  );
}

export function AddAssignment({ batchId }: { batchId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [briefMd, setBrief] = useState("");
  const [dueAt, setDue] = useState("");
  const [maxScore, setMax] = useState("100");
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <div className={panel}>
      <h3 className="mb-4 font-semibold text-gray-900">Set an assignment</h3>
      <div className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" className={input} />
        <textarea value={briefMd} onChange={(e) => setBrief(e.target.value)} rows={3} placeholder="The brief (markdown)" className={input} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-gray-500">Due</label>
            <input type="datetime-local" value={dueAt} onChange={(e) => setDue(e.target.value)} className={input} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Max score</label>
            <input type="number" min={1} value={maxScore} onChange={(e) => setMax(e.target.value)} className={input} />
          </div>
        </div>
        <FileUpload
          resourceId={batchId}
          scope="assignment"
          label={file ? `Replace brief (${file.fileName})` : "Attach a brief (optional)"}
          onUploaded={setFile}
        />
        <Err msg={error} />
        <button
          type="button"
          disabled={pending || !title}
          className={btn}
          onClick={() =>
            start(async () => {
              setError("");
              const r = await createAssignment(batchId, {
                title, briefMd, dueAt, maxScore,
                attachmentKey: file?.key ?? "",
                attachmentName: file?.fileName ?? "",
                published: true,
              });
              if (r && "error" in r) return setError(r.error);
              setTitle(""); setBrief(""); setDue(""); setFile(null);
              router.refresh();
            })
          }
        >
          {pending ? "Saving…" : "Publish assignment"}
        </button>
      </div>
    </div>
  );
}

export function Announce({ batchId }: { batchId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <div className={panel}>
      <h3 className="mb-4 font-semibold text-gray-900">Post to the batch</h3>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Announcement…" className={input} />
      <Err msg={error} />
      <button
        type="button"
        disabled={pending || !body.trim()}
        className={`${btn} mt-3`}
        onClick={() =>
          start(async () => {
            setError("");
            const r = await postMessage({ batchId, body, parentId: "" });
            if (r && "error" in r) return setError(r.error);
            setBody("");
            router.refresh();
          })
        }
      >
        {pending ? "Posting…" : "Post"}
      </button>
    </div>
  );
}

export function GradeForm({
  batchId,
  submissionId,
  maxScore,
  score,
  feedback,
}: {
  batchId: string;
  submissionId: string;
  maxScore: number;
  score: number | null;
  feedback: string | null;
}) {
  const router = useRouter();
  const [s, setS] = useState(score?.toString() ?? "");
  const [f, setF] = useState(feedback ?? "");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <div className="mt-2 flex flex-wrap items-start gap-2">
      <input
        type="number" min={0} max={maxScore} value={s}
        onChange={(e) => setS(e.target.value)}
        placeholder={`/ ${maxScore}`}
        className="w-24 rounded-lg bg-gray-50 px-3 py-1.5 text-sm ring-1 ring-gray-950/5"
      />
      <input
        value={f} onChange={(e) => setF(e.target.value)} placeholder="Feedback"
        className="min-w-[12rem] flex-1 rounded-lg bg-gray-50 px-3 py-1.5 text-sm ring-1 ring-gray-950/5"
      />
      <button
        type="button" disabled={pending || s === ""}
        className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        onClick={() =>
          start(async () => {
            setError("");
            const r = await gradeSubmission(batchId, { submissionId, score: s, feedback: f });
            if (r && "error" in r) return setError(r.error);
            router.refresh();
          })
        }
      >
        {pending ? "Saving…" : "Save"}
      </button>
      <Err msg={error} />
    </div>
  );
}
