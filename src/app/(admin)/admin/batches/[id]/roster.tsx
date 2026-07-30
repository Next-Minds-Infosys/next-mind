"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Trash2 } from "lucide-react";
import { enrolStudent, removeStudentFromBatch } from "../actions";

interface Row {
  membershipId: string;
  name: string | null;
  email: string;
  enrolledAt: string;
}

export function Roster({ batchId, students }: { batchId: string; students: Row[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [delivery, setDelivery] = useState<"email" | "hand">("email");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{ email: string; password?: string; emailed?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          setNotice(null);
          startTransition(async () => {
            // `name` is only used when the account does not exist yet; the
            // schema needs it either way, so fall back to the local part.
            const result = await enrolStudent(batchId, {
              email,
              name: name.trim() || email.split("@")[0],
              role: "STUDENT",
              delivery,
            });
            if ("error" in result) return setError(result.error);
            if (result.created) {
              setNotice({ email: result.email, password: result.password, emailed: result.emailed });
            }
            setEmail("");
            setName("");
            router.refresh();
          });
        }}
        className="space-y-2"
      >
        <div className="flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name (new students only)"
            className="min-w-[10rem] flex-1 rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <select
            value={delivery}
            onChange={(e) => setDelivery(e.target.value as "email" | "hand")}
            className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="email">Email the password</option>
            <option value="hand">Hand it over</option>
          </select>
        </div>
        <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@email.com"
          className="flex-1 rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add"}
        </button>
        </div>
      </form>

      {notice && (
        <div className="rounded-xl bg-teal-50 p-4 text-sm text-teal-900">
          <p className="font-medium">Account created for {notice.email} and enrolled.</p>
          {notice.password ? (
            <>
              <p className="mt-1 text-teal-800">
                {notice.emailed === false
                  ? "The email failed, so this password is only shown here — copy it now."
                  : "Give them this one-time password. It is not shown again."}
              </p>
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-white p-2">
                <code className="flex-1 break-all font-mono text-xs">{notice.password}</code>
                <button
                  type="button"
                  aria-label="Copy password"
                  onClick={() => {
                    navigator.clipboard.writeText(notice.password!);
                    setCopied(true);
                  }}
                  className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </>
          ) : (
            <p className="mt-1 text-teal-800">The password has been emailed to them.</p>
          )}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {students.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">No students in this batch yet.</p>
      ) : (
        <ul className="divide-y divide-gray-950/5">
          {students.map((s) => (
            <li key={s.membershipId} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{s.name ?? s.email}</p>
                <p className="text-xs text-gray-500">{s.email}</p>
              </div>
              <button
                type="button"
                aria-label={`Remove ${s.email}`}
                onClick={() =>
                  startTransition(async () => {
                    await removeStudentFromBatch(s.membershipId, batchId);
                    router.refresh();
                  })
                }
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
