"use client";

import { useState } from "react";
import { changePassword } from "./actions";

const input =
  "w-full rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500";

export function ChangePasswordForm({ forced }: { forced: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        if (next !== confirm) return setError("The two new passwords do not match.");
        setBusy(true);
        // Only returns on failure - on success the action redirects, so the
        // navigation happens without the client pushing anything.
        const result = await changePassword(current, next);
        setBusy(false);
        setError(result.error);
      }}
    >
      <div>
        <label className="text-sm font-medium text-gray-700">
          {forced ? "Temporary password" : "Current password"}
        </label>
        <input
          type="password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className={input}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">New password</label>
        <input
          type="password"
          required
          minLength={8}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className={input}
        />
        <p className="mt-1 text-xs text-gray-500">At least 8 characters.</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Confirm new password</label>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={input}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Saving…" : "Set password"}
      </button>
    </form>
  );
}
