"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, KeyRound, Loader2, Trash2 } from "lucide-react";
import { deleteUser, resetUserPassword, updateUser, userImpact } from "./actions";

interface Props {
  user: { id: string; name: string | null; email: string };
  /** Self-management is blocked server-side too; this just hides the buttons. */
  isSelf: boolean;
}

type Impact = Awaited<ReturnType<typeof userImpact>>;

const input =
  "w-full rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500";

export function UserRowActions({ user, isSelf }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<null | "edit" | "reset" | "delete">(null);
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [impact, setImpact] = useState<Impact | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const close = () => {
    setMode(null);
    setError("");
    setPassword("");
    setImpact(null);
    setCopied(false);
  };

  const lines =
    impact && !("error" in impact)
      ? ([
          ["batches taught", impact.batchesTaught],
          ["batch enrolments", impact.enrolledIn],
          ["submissions", impact.submissions],
          ["messages", impact.messages],
        ] as const).filter(([, n]) => n > 0)
      : [];

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setMode("edit")}
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          Edit
        </button>
        <button
          type="button"
          title="Reset password"
          aria-label={`Reset password for ${user.email}`}
          onClick={() => setMode("reset")}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <KeyRound size={15} />
        </button>
        {!isSelf && (
          <button
            type="button"
            title="Delete user"
            aria-label={`Delete ${user.email}`}
            disabled={pending}
            onClick={() => {
              setError("");
              setMode("delete");
              start(async () => setImpact(await userImpact(user.id)));
            }}
            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
        )}
      </div>

      {mode === "edit" && (
        <Modal title="Edit user" onClose={close}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setError("");
              start(async () => {
                const r = await updateUser(user.id, { name, email });
                if ("error" in r) return setError(r.error);
                close();
                router.refresh();
              });
            }}
          >
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                className={input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                This is their login identifier — changing it changes how they sign in.
              </p>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending && <Loader2 size={16} className="animate-spin" />}
              {pending ? "Saving…" : "Save changes"}
            </button>
          </form>
        </Modal>
      )}

      {mode === "reset" && (
        <Modal title="Reset password" onClose={close}>
          {password ? (
            <>
              <p className="text-sm text-gray-700">
                New one-time password for <strong>{user.email}</strong>. It is shown once and cannot
                be retrieved again — they must change it at first sign-in.
              </p>
              <div className="my-3 flex items-center gap-2 rounded-xl bg-gray-50 p-3">
                <code className="flex-1 break-all font-mono text-sm">{password}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(password);
                    setCopied(true);
                  }}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-200"
                  aria-label="Copy password"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <button
                type="button"
                onClick={close}
                className="w-full rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-700">
                Generate a new password for <strong>{user.email}</strong>? Their current password
                stops working immediately and all their sessions are signed out.
              </p>
              {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const r = await resetUserPassword(user.id);
                      if ("error" in r) return setError(r.error);
                      setPassword(r.password);
                      router.refresh();
                    })
                  }
                  className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {pending && <Loader2 size={16} className="animate-spin" />}
                  {pending ? "Resetting…" : "Reset password"}
                </button>
                <button type="button" onClick={close} className="rounded-full px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100">
                  Cancel
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {mode === "delete" && (
        <Modal title={`Delete ${user.email}?`} onClose={close}>
          {impact && "error" in impact ? (
            <p className="text-sm text-red-600">{impact.error}</p>
          ) : (
            <>
              {lines.length > 0 ? (
                <>
                  <p className="text-sm text-gray-700">Deleting this account also removes:</p>
                  <ul className="my-3 space-y-1 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    {lines.map(([label, n]) => (
                      <li key={label}>
                        <strong className="tabular-nums">{n}</strong> {label}
                      </li>
                    ))}
                  </ul>
                  {impact && !("error" in impact) && impact.batchesTaught > 0 && (
                    <p className="mb-3 text-sm text-amber-700">
                      Their {impact.batchesTaught} batch
                      {impact.batchesTaught === 1 ? "" : "es"} will survive but be left without an
                      instructor.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-700">This account has no attached records.</p>
              )}
              <p className="mb-4 text-sm text-gray-500">This cannot be undone.</p>
              {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const r = await deleteUser(user.id);
                      if ("error" in r) return setError(r.error);
                      close();
                      router.refresh();
                    })
                  }
                  className="flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {pending && <Loader2 size={16} className="animate-spin" />}
                  {pending ? "Deleting…" : "Delete user"}
                </button>
                <button type="button" onClick={close} className="rounded-full px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100">
                  Cancel
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-gray-950/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="my-8 w-full max-w-md rounded-2xl bg-white p-6 ring-1 ring-gray-950/5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
