"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { colors, gradient } from "@/lib/theme";

/**
 * Sign-in for students and instructors.
 *
 * On success it sends everyone to /account, which resolves the correct
 * dashboard server-side from the session's role - the client is never trusted
 * to decide where a role may go.
 */
export default function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  const input =
    "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all border-[1.5px]";

  // Rendered through a portal on purpose. The Navbar that owns this component
  // sets `backdrop-filter` on its <nav>, and a filtered element becomes the
  // containing block for fixed-position descendants - so in place, `inset-0`
  // resolves to the 64px-tall navbar instead of the viewport and the dialog is
  // clipped off the top of the screen.
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
      style={{ backgroundColor: "rgba(13,45,82,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative my-auto w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl"
        style={{ backgroundColor: colors.card }}
      >
        <div className="p-6 text-white" style={{ background: gradient }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/20 hover:text-white"
          >
            <X size={16} />
          </button>
          <div className="mb-1 text-2xl">🎓</div>
          <h2 className="font-display text-xl font-bold">Student &amp; Instructor Login</h2>
          <p className="mt-1 text-sm opacity-80">
            Sign in to reach your batch, recordings and assignments.
          </p>
        </div>

        <form
          className="space-y-4 p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setBusy(true);
            const { error: authError } = await signIn.email({ email, password });
            setBusy(false);
            if (authError) return setError(authError.message ?? "Incorrect email or password.");
            onClose();
            router.push("/account");
            router.refresh();
          }}
        >
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
              style={{ color: colors.muted }}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className={input}
              style={{ borderColor: colors.border, backgroundColor: colors.surface, color: colors.navy }}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
              style={{ color: colors.muted }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
              style={{ borderColor: colors.border, backgroundColor: colors.surface, color: colors.navy }}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl py-3.5 font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: gradient, boxShadow: `0 4px 20px ${colors.teal}40` }}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-center text-xs" style={{ color: colors.muted }}>
            Accounts are created by Next Minds — contact us if you don&apos;t have one.
          </p>
        </form>
      </div>
    </div>,
    document.body,
  );
}
