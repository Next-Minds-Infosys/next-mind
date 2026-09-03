"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Circle,
  Mic,
  MicOff,
  Monitor,
  Square,
  Trash2,
  UploadCloud,
  Video,
  VideoOff,
} from "lucide-react";
import { uploadToS3, type UploadedFile, type UploadScope } from "./file-upload";
import {
  appendChunk,
  beginSession,
  deleteSession,
  finishSession,
  listSessions,
  loadBlob,
  pruneOlderThan,
  storageAvailable,
  type RecordingSession,
} from "@/lib/recording-store";

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

/** Turns a getUserMedia rejection into something an instructor can act on. */
function permissionMessage(e: unknown, device: "Microphone" | "Camera") {
  const name = e instanceof DOMException ? e.name : "";
  if (name === "NotAllowedError")
    return `${device} access was blocked. Click the camera/lock icon in the address bar, allow it for this site, then try again.`;
  if (name === "NotFoundError") return `No ${device.toLowerCase()} was found on this device.`;
  if (name === "NotReadableError")
    return `Your ${device.toLowerCase()} is in use by another app. Close it (Zoom, Meet, Teams) and try again.`;
  return `Could not start the ${device.toLowerCase()}.`;
}

/**
 * Screen recorder for lesson videos.
 *
 * getDisplayMedia lets the instructor pick any screen, window or tab -
 * including applications outside this site. The browser shows its own picker
 * and recording indicator, nothing is captured without that choice, and we
 * never see the stream: MediaRecorder encodes locally and the finished blob
 * goes to S3 through the same presigned PUT the file picker uses.
 *
 * Permission order matters. The screen picker consumes the click's transient
 * user activation, so asking for the microphone AFTER it returns is rejected
 * with NotAllowedError and the lesson records silent. Microphone and camera are
 * therefore requested first, while the activation from the button press is
 * still fresh, and a refusal stops the flow instead of quietly recording mute.
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
  const [withCamera, setWithCamera] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const [micLive, setMicLive] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  /** Set while an interrupted recording from a previous session is available. */
  const [recovered, setRecovered] = useState<RecordingSession | null>(null);
  const [retryNote, setRetryNote] = useState("");
  /**
   * Whether chunks are actually reaching IndexedDB. Seeded from feature
   * detection rather than set inside an effect - React 19 flags a synchronous
   * setState there as a cascading render, and the answer is already knowable at
   * first render.
   */
  const [persisting, setPersisting] = useState(() => storageAvailable());

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  /** id of the row in IndexedDB that mirrors chunksRef as it fills. */
  const sessionIdRef = useRef<string | null>(null);
  const seqRef = useRef(0);
  const stopAllRef = useRef<() => void>(() => {});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // A recording left behind by a crashed or closed tab. Surfaced on mount so
  // the work is offered back instead of quietly rotting in IndexedDB.
  useEffect(() => {
    if (!storageAvailable()) return;
    let cancelled = false;
    (async () => {
      try {
        await pruneOlderThan();
        const sessions = await listSessions();
        const orphan = sessions.find((x) => x.resourceId === resourceId && x.bytes > 0);
        if (!cancelled && orphan) setRecovered(orphan);
      } catch {
        // A broken store must never stop someone recording.
        if (!cancelled) setPersisting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resourceId]);

  // Recording and uploading both hold data that is not yet on S3, so leaving
  // the page is worth a confirmation.
  useEffect(() => {
    const risky = recording || progress !== null;
    if (!risky) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [recording, progress]);

  async function startRecording() {
    setError("");
    const mimeType = pickMimeType();
    if (!mimeType) {
      setError("This browser cannot record video. Try Chrome, Edge or Firefox.");
      return;
    }

    const opened: MediaStream[] = [];
    const closeOpened = () => opened.forEach((s) => s.getTracks().forEach((t) => t.stop()));

    // ---- 1. Microphone and camera FIRST, while the click activation is live.
    let mic: MediaStream | null = null;
    if (withMic) {
      try {
        mic = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        opened.push(mic);
      } catch (e) {
        setError(permissionMessage(e, "Microphone"));
        return;
      }
    }

    let camera: MediaStream | null = null;
    if (withCamera) {
      try {
        camera = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, frameRate: 30 },
        });
        opened.push(camera);
      } catch (e) {
        setError(permissionMessage(e, "Camera"));
        closeOpened();
        return;
      }
    }

    // ---- 2. Then the screen picker.
    let display: MediaStream;
    try {
      display = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true, // system/tab audio when the picker offers it
      });
      opened.push(display);
    } catch {
      // Cancelling the picker lands here too - not an error worth showing.
      closeOpened();
      return;
    }

    // ---- 3. Audio: sum mic and system audio into one track.
    let audioContext: AudioContext | null = null;
    let meterRaf = 0;
    const audioTracks: MediaStreamTrack[] = [];
    const audioSources = [
      ...(display.getAudioTracks().length > 0 ? [display] : []),
      ...(mic ? [mic] : []),
    ];

    if (audioSources.length > 0) {
      audioContext = new AudioContext();
      // Created after two awaits, so the context can start suspended - which
      // records a silent track. Resuming is what actually makes audio flow.
      if (audioContext.state === "suspended") await audioContext.resume();

      const dest = audioContext.createMediaStreamDestination();
      for (const s of audioSources) {
        audioContext.createMediaStreamSource(s).connect(dest);
      }
      audioTracks.push(...dest.stream.getAudioTracks());

      // Live input meter, so a dead microphone is visible during the take
      // rather than discovered after the lesson is recorded.
      if (mic) {
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        audioContext.createMediaStreamSource(mic).connect(analyser);
        const buf = new Uint8Array(analyser.frequencyBinCount);
        setMicLive(true);
        const tick = () => {
          analyser.getByteTimeDomainData(buf);
          let peak = 0;
          for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
          setMicLevel(Math.min(1, peak / 90));
          meterRaf = requestAnimationFrame(tick);
        };
        meterRaf = requestAnimationFrame(tick);
      }
    }

    // ---- 4. Video: screen alone, or screen with the camera composited in.
    let videoTrack = display.getVideoTracks()[0];
    let composeRaf = 0;
    let screenEl: HTMLVideoElement | null = null;
    let camEl: HTMLVideoElement | null = null;

    if (camera) {
      const settings = videoTrack.getSettings();
      const width = settings.width ?? 1280;
      const height = settings.height ?? 720;

      screenEl = document.createElement("video");
      screenEl.srcObject = display;
      screenEl.muted = true;
      camEl = document.createElement("video");
      camEl.srcObject = camera;
      camEl.muted = true;
      await Promise.all([screenEl.play(), camEl.play()]);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx2d = canvas.getContext("2d");

      // Picture-in-picture: the webcam sits bottom-right at a fifth of the
      // frame width, which stays legible without covering the content.
      const pipW = Math.round(width / 5);
      const pipH = Math.round((pipW * 3) / 4);
      const pad = Math.round(width / 60);

      const draw = () => {
        if (ctx2d && screenEl && camEl) {
          ctx2d.drawImage(screenEl, 0, 0, width, height);
          const x = width - pipW - pad;
          const y = height - pipH - pad;
          ctx2d.save();
          ctx2d.shadowColor = "rgba(0,0,0,0.45)";
          ctx2d.shadowBlur = 14;
          ctx2d.drawImage(camEl, x, y, pipW, pipH);
          ctx2d.restore();
          ctx2d.strokeStyle = "rgba(255,255,255,0.85)";
          ctx2d.lineWidth = Math.max(2, Math.round(width / 640));
          ctx2d.strokeRect(x, y, pipW, pipH);
        }
        composeRaf = requestAnimationFrame(draw);
      };
      composeRaf = requestAnimationFrame(draw);
      videoTrack = canvas.captureStream(30).getVideoTracks()[0];
    }

    const combined = new MediaStream([videoTrack, ...audioTracks]);
    const recorder = new MediaRecorder(combined, { mimeType });
    chunksRef.current = [];

    const stopAll = () => {
      cancelAnimationFrame(meterRaf);
      cancelAnimationFrame(composeRaf);
      closeOpened();
      combined.getTracks().forEach((t) => t.stop());
      if (screenEl) screenEl.srcObject = null;
      if (camEl) camEl.srcObject = null;
      void audioContext?.close();
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setMicLive(false);
      setMicLevel(0);
    };
    stopAllRef.current = stopAll;

    recorder.ondataavailable = (e) => {
      if (e.data.size === 0) return;
      chunksRef.current.push(e.data);

      // Mirror the chunk to IndexedDB. Fire-and-forget on purpose: awaiting
      // here would block the encoder callback, and the in-memory copy is still
      // authoritative for this tab. Persistence is the crash insurance.
      const id = sessionIdRef.current;
      if (id) {
        const seq = seqRef.current++;
        void appendChunk(id, seq, e.data).then((ok) => {
          // Quota exhaustion on a very long recording. Say so once rather than
          // implying the recording is still protected.
          if (!ok) setPersisting(false);
        });
      }
    };
    recorder.onstop = () => {
      stopAll();
      setRecording(false);
      const out = new Blob(chunksRef.current, { type: mimeType.split(";")[0] });
      setBlob(out);
      // Marks a clean stop, so this session is no longer treated as an
      // interrupted one if the tab dies before the upload finishes.
      if (sessionIdRef.current) void finishSession(sessionIdRef.current);
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
    // Timeslice so chunks arrive every second and can be persisted as they go.
    // Without the IndexedDB mirror below this interval bought nothing: the data
    // still only existed in this tab's memory.
    recorder.start(1000);
    recorderRef.current = recorder;

    seqRef.current = 0;
    sessionIdRef.current = null;
    if (storageAvailable()) {
      const id = `${resourceId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      beginSession({ id, resourceId, scope, mimeType: mimeType.split(";")[0] })
        .then(() => {
          sessionIdRef.current = id;
          setPersisting(true);
        })
        .catch(() => setPersisting(false));
    }
    setBlob(null);
    setSeconds(0);
    setRecording(true);
    timerRef.current = setInterval(() => setSeconds((n) => n + 1), 1000);
  }

  function stopRecording() {
    if (recorderRef.current?.state !== "inactive") recorderRef.current?.stop();
  }

  function discard() {
    const id = sessionIdRef.current;
    if (id) {
      void deleteSession(id);
      sessionIdRef.current = null;
    }
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
    setRetryNote("");
    setProgress(0);
    try {
      const ext = blob.type.includes("mp4") ? "mp4" : "webm";
      const name = `screen-recording-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.${ext}`;
      const file = new File([blob], name, { type: blob.type });
      const uploaded = await uploadToS3({
        file,
        resourceId,
        scope,
        onProgress: setProgress,
        onRetry: (attempt, waitMs, reason) =>
          setRetryNote(
            `${reason} Retrying in ${Math.round(waitMs / 1000)}s (attempt ${attempt + 1} of 4)…`,
          ),
      });
      setRetryNote("");
      onUploaded(uploaded);
      setProgress(100);

      // Only now is the recording safe somewhere else. Clearing earlier would
      // discard the one durable copy the moment the network wobbled.
      const id = sessionIdRef.current ?? recovered?.id;
      if (id) {
        void deleteSession(id);
        sessionIdRef.current = null;
        setRecovered(null);
      }
    } catch (e) {
      setRetryNote("");
      setError(
        (e instanceof Error ? e.message : "Upload failed.") +
          (persisting
            ? " Your recording is saved on this device - reopen this page to try again."
            : ""),
      );
      setProgress(null);
    }
  }

  /** Pull an interrupted recording back into the editor. */
  async function restoreRecovered() {
    if (!recovered) return;
    setError("");
    try {
      const out = await loadBlob(recovered.id, recovered.mimeType);
      if (!out || out.size === 0) {
        setError("That recording could not be read back.");
        await deleteSession(recovered.id);
        setRecovered(null);
        return;
      }
      sessionIdRef.current = recovered.id;
      setBlob(out);
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(out);
      });
      setSeconds(Math.round((( recovered.finishedAt ?? Date.now()) - recovered.startedAt) / 1000));
      setRecovered(null);
    } catch {
      setError("That recording could not be restored.");
    }
  }

  async function discardRecovered() {
    if (!recovered) return;
    await deleteSession(recovered.id);
    setRecovered(null);
  }

  if (!supported) {
    return (
      <p className="rounded-xl border border-nm-border bg-nm-surface px-4 py-3 text-xs text-nm-muted">
        Screen recording needs Chrome, Edge or Firefox on a secure (https) connection. You can
        still upload a video file.
      </p>
    );
  }

  const toggle = (on: boolean) =>
    `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
      on ? "bg-teal-50 text-teal-700" : "bg-nm-surface text-nm-muted"
    }`;

  return (
    <div className="rounded-xl border border-nm-border p-4">
      {recovered && !recording && !blob && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-900">
            Unfinished recording found
          </p>
          <p className="mt-1 text-xs text-amber-800">
            {mb(recovered.bytes)} recorded on{" "}
            {new Date(recovered.startedAt).toLocaleString()}
            {recovered.finishedAt
              ? " — finished but never uploaded."
              : " — this tab closed while recording."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={restoreRecovered}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white"
            >
              Restore it
            </button>
            <button
              type="button"
              onClick={discardRecovered}
              className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {retryNote && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
          {retryNote}
        </p>
      )}

      {recording && !persisting && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          This device cannot save the recording as it goes — if the tab closes, it will be lost.
          Keep this tab open until the upload finishes.
        </p>
      )}

      {recording && persisting && (
        <p className="mb-3 text-xs text-nm-muted">
          Saving to this device as you record — a crash or a lost connection will not lose it.
        </p>
      )}

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
              className={toggle(withMic)}
            >
              {withMic ? <Mic size={14} /> : <MicOff size={14} />}
              {withMic ? "Microphone on" : "Microphone off"}
            </button>
            <button
              type="button"
              onClick={() => setWithCamera((v) => !v)}
              aria-pressed={withCamera}
              className={toggle(withCamera)}
            >
              {withCamera ? <Video size={14} /> : <VideoOff size={14} />}
              {withCamera ? "Camera on" : "Camera off"}
            </button>
          </div>
          <p className="mt-2 text-xs text-nm-muted">
            Records any screen, window or tab you pick — including apps outside this site. Your
            browser will ask for
            {withMic && withCamera
              ? " microphone and camera access"
              : withMic
                ? " microphone access"
                : withCamera
                  ? " camera access"
                  : " screen access"}{" "}
            first, then which screen to share.
          </p>
        </>
      )}

      {recording && (
        <div className="space-y-3">
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
            {withCamera && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-nm-muted">
                <Video size={13} aria-hidden="true" />
                Camera overlay on
              </span>
            )}
          </div>

          {micLive && (
            <div className="flex items-center gap-2">
              <Mic size={14} className="flex-shrink-0 text-nm-muted" aria-hidden="true" />
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-nm-surface">
                <div
                  className="h-full rounded-full bg-teal-500 transition-[width] duration-75"
                  style={{ width: `${Math.round(micLevel * 100)}%` }}
                />
              </div>
              <span className="text-xs text-nm-muted">
                {micLevel > 0.03 ? "picking up sound" : "no sound detected"}
              </span>
            </div>
          )}
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
