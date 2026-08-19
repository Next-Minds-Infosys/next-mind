"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Circle, Mic, MicOff, Monitor, Square, Trash2, UploadCloud } from "lucide-react";
import { uploadToS3, type UploadedFile, type UploadScope } from "./file-upload";

/**
 * Preferred first. Chrome can record H.264 in MP4 on recent versions, which is
 * the only combination that plays everywhere including Safari and iOS; WebM is
 * the fallback and is fine in Chrome, Edge and Firefox.
 */
const MIME_CANDIDATES = [
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

function pickMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  return MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t)) ?? null;
}

function clock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function mb(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Screen recorder for lesson videos.
 *
 * Uses getDisplayMedia, so the instructor can pick any screen, window or tab -
 * including applications outside this site - and the browser shows its own
 * picker and recording indicator. Nothing is captured without that explicit
 * choice, and we never see the stream: it is encoded locally by MediaRecorder
 * and the finished blob goes straight to S3 through the same presigned PUT the
 * file picker uses.
 *
 * Requires a secure context. getDisplayMedia is undefined on plain HTTP other
 * than localhost, so the control explains that rather than failing on click.
 */
export function ScreenRecorder({
  resourceId,
  scope = "lesson",
  onUploaded,
}: {
  resourceId: string;
  scope?: UploadScope;
  onUploaded: (file: UploadedFile) => void;
}) {
  // Capability check without setState-in-effect: the store never changes, so
  // this is just "read this on the client". The server snapshot reports
  // supported so SSR renders the normal control rather than flashing the
  // unsupported message before hydration corrects it.
  const supported = useSyncExternalStore(
    () => () => {},
    () =>
      typeof navigator !== "undefined" &&
      typeof navigator.mediaDevices?.getDisplayMedia === "function" &&
      pickMimeType() !== null,
    () => true,
  );
  const [withMic, setWithMic] = useState(true);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const stopAllRef = useRef<() => void>(() => {});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Revoke the object URL when it is replaced or the component goes away;
  // otherwise each re-record leaks a multi-hundred-megabyte blob.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAllRef.current();
    };
  }, []);

  async function startRecording() {
    setError("");
    const mimeType = pickMimeType();
    if (!mimeType) {
      setError("This browser cannot record video. Try Chrome, Edge or Firefox.");
      return;
    }

    let display: MediaStream;
    try {
      display = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true, // system/tab audio when the picker offers it
      });
    } catch {
      // Cancelling the picker lands here too, which is not an error worth showing.
      return;
    }

    const tracks: MediaStreamTrack[] = [...display.getVideoTracks()];
    const cleanups: MediaStream[] = [display];

    // Mix screen audio with the microphone. Two audio tracks in one recording
    // are not portable, so they are summed into a single track via WebAudio.
    let audioContext: AudioContext | null = null;
    try {
      const sources: MediaStream[] = [];
      if (display.getAudioTracks().length > 0) sources.push(display);
      if (withMic) {
        const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
        cleanups.push(mic);
        sources.push(mic);
      }
      if (sources.length === 1) {
        tracks.push(...sources[0].getAudioTracks());
      } else if (sources.length > 1) {
        audioContext = new AudioContext();
        const dest = audioContext.createMediaStreamDestination();
        for (const s of sources) audioContext.createMediaStreamSource(s).connect(dest);
        tracks.push(...dest.stream.getAudioTracks());
      }
    } catch {
      setError("Recording without the microphone — permission was refused.");
    }

    const combined = new MediaStream(tracks);
    const recorder = new MediaRecorder(combined, { mimeType });
    chunksRef.current = [];

    const stopAll = () => {
      for (const s of cleanups) s.getTracks().forEach((t) => t.stop());
      combined.getTracks().forEach((t) => t.stop());
      void audioContext?.close();
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
    stopAllRef.current = stopAll;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      stopAll();
      setRecording(false);
      const base = mimeType.split(";")[0];
      const out = new Blob(chunksRef.current, { type: base });
      setBlob(out);
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(out);
      });
    };

    // "Stop sharing" in the browser's own bar ends the video track, which must
    // also end the recording - otherwise it keeps writing a frozen frame.
    display.getVideoTracks()[0]?.addEventListener("ended", () => {
      if (recorder.state !== "inactive") recorder.stop();
    });

    // Timeslice so data arrives progressively; a single final chunk risks
    // losing a long recording if the tab is closed.
    recorder.start(1000);
    recorderRef.current = recorder;
    setBlob(null);
    setSeconds(0);
    setRecording(true);
    timerRef.current = setInterval(() => setSeconds((n) => n + 1), 1000);
  }

  function stopRecording() {
    if (recorderRef.current?.state !== "inactive") recorderRef.current?.stop();
  }

  function discard() {
    setBlob(null);
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setSeconds(0);
    setProgress(null);
  }

  async function upload() {
    if (!blob) return;
    setError("");
    setProgress(0);
    try {
      const ext = blob.type.includes("mp4") ? "mp4" : "webm";
      const name = `screen-recording-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.${ext}`;
      const file = new File([blob], name, { type: blob.type });
      const uploaded = await uploadToS3({ file, resourceId, scope, onProgress: setProgress });
      onUploaded(uploaded);
      setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      setProgress(null);
    }
  }

  if (!supported) {
    return (
      <p className="rounded-xl border border-nm-border bg-nm-surface px-4 py-3 text-xs text-nm-muted">
        Screen recording needs Chrome, Edge or Firefox on a secure (https) connection. You can
        still upload a video file.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-nm-border p-4">
      {!recording && !blob && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-2 rounded-xl bg-nm-surface px-4 py-2.5 text-sm font-semibold text-nm-navy ring-1 ring-nm-border transition-colors hover:bg-nm-border/50"
            >
              <Monitor size={16} aria-hidden="true" />
              Record screen
            </button>
            <button
              type="button"
              onClick={() => setWithMic((v) => !v)}
              aria-pressed={withMic}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                withMic ? "bg-teal-50 text-teal-700" : "bg-nm-surface text-nm-muted"
              }`}
            >
              {withMic ? <Mic size={14} /> : <MicOff size={14} />}
              {withMic ? "Microphone on" : "Microphone off"}
            </button>
          </div>
          <p className="mt-2 text-xs text-nm-muted">
            Records any screen, window or tab you pick — including apps outside this site. The
            recording is uploaded straight to your own storage.
          </p>
        </>
      )}

      {recording && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-600">
            <Circle size={10} className="animate-pulse fill-current" aria-hidden="true" />
            Recording {clock(seconds)}
          </span>
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-2 rounded-xl bg-nm-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Square size={14} className="fill-current" aria-hidden="true" />
            Stop
          </button>
        </div>
      )}

      {blob && previewUrl && (
        <div>
          <video src={previewUrl} controls className="aspect-video w-full rounded-lg bg-black" />
          <p className="mt-2 text-xs text-nm-muted">
            {clock(seconds)} · {mb(blob.size)} · {blob.type.includes("mp4") ? "MP4" : "WebM"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={upload}
              disabled={progress !== null && progress < 100}
              className="inline-flex items-center gap-2 rounded-xl bg-nm-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <UploadCloud size={15} aria-hidden="true" />
              {progress === 100 ? "Uploaded" : "Use this recording"}
            </button>
            <button
              type="button"
              onClick={discard}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-nm-muted transition-colors hover:text-nm-navy"
            >
              <Trash2 size={15} aria-hidden="true" />
              Discard
            </button>
          </div>
          {progress !== null && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-nm-surface">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-nm-muted">
                {progress === 100 ? "Uploaded" : `Uploading… ${progress}%`}
              </p>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
