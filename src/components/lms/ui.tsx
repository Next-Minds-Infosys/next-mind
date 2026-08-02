import Link from "next/link";

export const panel = "rounded-2xl bg-white p-6 ring-1 ring-gray-950/5";

export function PageHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <header>
      <p className="text-sm font-medium text-teal-600">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-semibold text-gray-900">{title}</h1>
      {sub && <p className="mt-1 text-sm text-gray-500">{sub}</p>}
    </header>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warn" | "good";
  href?: string;
}) {
  const toneClass =
    tone === "warn" ? "text-amber-600" : tone === "good" ? "text-teal-600" : "text-gray-900";
  const body = (
    <div className={`${panel} h-full transition ${href ? "hover:ring-teal-500/30" : ""}`}>
      <p className={`text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
      <p className="mt-0.5 text-sm text-gray-500">{label}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

/** Completion bar. `percent` is already clamped 0-100 by the caller. */
export function Progress({ percent }: { percent: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function Empty({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className={`${panel} py-12 text-center`}>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {sub && <p className="mt-1 text-sm text-gray-500">{sub}</p>}
    </div>
  );
}

const badgeTone: Record<string, string> = {
  overdue: "bg-red-50 text-red-700",
  due: "bg-amber-50 text-amber-700",
  submitted: "bg-blue-50 text-blue-700",
  graded: "bg-teal-50 text-teal-700",
  muted: "bg-gray-100 text-gray-500",
};

export function Badge({ tone, children }: { tone: keyof typeof badgeTone; children: React.ReactNode }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeTone[tone]}`}>
      {children}
    </span>
  );
}

/** Consistent, timezone-stable date rendering across the portal. */
export function fmtDate(d: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function dueState(dueAt: Date | null, submittedAt: Date | null, gradedAt: Date | null) {
  if (gradedAt) return "graded" as const;
  if (submittedAt) return "submitted" as const;
  if (dueAt && dueAt.getTime() < Date.now()) return "overdue" as const;
  return "due" as const;
}
