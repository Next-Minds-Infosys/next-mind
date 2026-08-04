"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { changePassword } from "./actions";

const input =
  "w-full rounded-xl bg-gray-50 px-4 py-2.5 pr-11 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500";

/** Same reveal-toggle pattern as login-form.tsx - each field gets its own button/state. */
function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  minLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="text-sm font-medium text-gray-700" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={input}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

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
      <PasswordField
        id="current-password"
        label={forced ? "Temporary password" : "Current password"}
        value={current}
        onChange={setCurrent}
        autoComplete="current-password"
      />
      <div>
        <PasswordField
          id="new-password"
          label="New password"
          value={next}
          onChange={setNext}
          autoComplete="new-password"
          minLength={8}
        />
        <p className="mt-1 text-xs text-gray-500">At least 8 characters.</p>
      </div>
      <PasswordField
        id="confirm-password"
        label="Confirm new password"
        value={confirm}
        onChange={setConfirm}
        autoComplete="new-password"
      />

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
