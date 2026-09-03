/**
 * Durable storage for in-progress screen recordings.
 *
 * MediaRecorder hands back chunks as it encodes. Holding them in a JS array is
 * fine until the tab dies - a crash, an accidental close, a navigation, or the
 * OS reclaiming memory - and then a lecture that took 45 minutes to record is
 * gone with no trace. Chunks are written here as they arrive instead, so the
 * recording survives anything short of clearing site data, and an interrupted
 * session can be recovered on the next visit.
 *
 * IndexedDB rather than localStorage because only IndexedDB stores Blobs; a
 * localStorage round trip through base64 would inflate the data by a third and
 * blow the 5MB quota within seconds of recording.
 */

const DB_NAME = "nm-recordings";
const DB_VERSION = 1;
const CHUNKS = "chunks";
const SESSIONS = "sessions";

export interface RecordingSession {
  id: string;
  /** Batch or other resource the upload will be scoped to. */
  resourceId: string;
  scope: string;
  mimeType: string;
  startedAt: number;
  /** Set when the recorder stops cleanly. Absent means the tab died mid-record. */
  finishedAt?: number;
  bytes: number;
  chunkCount: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(SESSIONS)) {
        db.createObjectStore(SESSIONS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(CHUNKS)) {
        // Composite key keeps chunks ordered per session without a second index.
        db.createObjectStore(CHUNKS, { keyPath: ["sessionId", "seq"] });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Could not open recording store"));
  });
}

function tx<T>(
  db: IDBDatabase,
  stores: string[],
  mode: IDBTransactionMode,
  run: (t: IDBTransaction) => IDBRequest<T> | void,
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(stores, mode);
    // Handlers are attached before `run` so a synchronous failure inside it is
    // still reported through the transaction rather than thrown into the void.
    const result: { req?: IDBRequest<T> | void } = {};
    t.oncomplete = () => resolve(result.req ? result.req.result : undefined);
    t.onerror = () => reject(t.error ?? new Error("Recording store write failed"));
    t.onabort = () => reject(t.error ?? new Error("Recording store write aborted"));
    result.req = run(t);
  });
}

/** Feature detection - Safari private mode and some embedded webviews have no IDB. */
export function storageAvailable() {
  return typeof indexedDB !== "undefined";
}

export async function beginSession(
  meta: Omit<RecordingSession, "bytes" | "chunkCount" | "startedAt">,
): Promise<RecordingSession> {
  const session: RecordingSession = { ...meta, startedAt: Date.now(), bytes: 0, chunkCount: 0 };
  const db = await openDb();
  await tx(db, [SESSIONS], "readwrite", (t) => t.objectStore(SESSIONS).put(session));
  db.close();
  return session;
}

/**
 * Appends one encoded chunk and updates the running totals.
 *
 * Returns false when the write fails - almost always a quota error on a very
 * long recording. The caller keeps recording in memory in that case rather than
 * aborting: degraded durability beats stopping the lecture.
 */
export async function appendChunk(sessionId: string, seq: number, data: Blob): Promise<boolean> {
  try {
    const db = await openDb();
    await tx(db, [CHUNKS, SESSIONS], "readwrite", (t) => {
      t.objectStore(CHUNKS).put({ sessionId, seq, data });
      const store = t.objectStore(SESSIONS);
      const get = store.get(sessionId);
      get.onsuccess = () => {
        const s = get.result as RecordingSession | undefined;
        if (!s) return;
        s.bytes += data.size;
        s.chunkCount = Math.max(s.chunkCount, seq + 1);
        store.put(s);
      };
    });
    db.close();
    return true;
  } catch {
    return false;
  }
}

export async function finishSession(sessionId: string): Promise<void> {
  const db = await openDb();
  await tx(db, [SESSIONS], "readwrite", (t) => {
    const store = t.objectStore(SESSIONS);
    const get = store.get(sessionId);
    get.onsuccess = () => {
      const s = get.result as RecordingSession | undefined;
      if (s) store.put({ ...s, finishedAt: Date.now() });
    };
  });
  db.close();
}

/** Every stored session, newest first. Includes ones that never finished. */
export async function listSessions(): Promise<RecordingSession[]> {
  const db = await openDb();
  const all = await tx<RecordingSession[]>(db, [SESSIONS], "readonly", (t) =>
    t.objectStore(SESSIONS).getAll() as IDBRequest<RecordingSession[]>,
  );
  db.close();
  return (all ?? []).sort((a, b) => b.startedAt - a.startedAt);
}

/** Reassembles the chunks back into a single playable/uploadable Blob. */
export async function loadBlob(sessionId: string, mimeType: string): Promise<Blob | null> {
  const db = await openDb();
  const rows = await tx<{ sessionId: string; seq: number; data: Blob }[]>(
    db,
    [CHUNKS],
    "readonly",
    (t) =>
      t.objectStore(CHUNKS).getAll(
        IDBKeyRange.bound([sessionId, -Infinity], [sessionId, Infinity]),
      ) as IDBRequest<{ sessionId: string; seq: number; data: Blob }[]>,
  );
  db.close();
  if (!rows || rows.length === 0) return null;
  rows.sort((a, b) => a.seq - b.seq);
  return new Blob(rows.map((r) => r.data), { type: mimeType });
}

/** Called only after an upload is confirmed, or when the user discards. */
export async function deleteSession(sessionId: string): Promise<void> {
  const db = await openDb();
  await tx(db, [CHUNKS, SESSIONS], "readwrite", (t) => {
    t.objectStore(SESSIONS).delete(sessionId);
    t.objectStore(CHUNKS).delete(
      IDBKeyRange.bound([sessionId, -Infinity], [sessionId, Infinity]),
    );
  });
  db.close();
}

/**
 * Drops sessions older than a week so the store cannot grow without bound if a
 * recording is abandoned and never recovered.
 */
export async function pruneOlderThan(ms = 7 * 24 * 60 * 60 * 1000): Promise<void> {
  const cutoff = Date.now() - ms;
  for (const s of await listSessions()) {
    if (s.startedAt < cutoff) await deleteSession(s.id);
  }
}
