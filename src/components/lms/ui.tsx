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

/* ------------------------------------------------------------------ shell
 * The batch pages were a stack of identical unlabelled white cards, so a
 * student landing on an empty batch saw four boxes reading "Nothing yet" with
 * no sense of where they were or what happens next. These give each section an
 * icon and a count, and turn empty states into an explanation rather than a
 * dead end.
 *
 * Both portals render server-side, so passing a Lucide component here is safe -
 * unlike the nav, which crosses into a client component.
 */

import type { LucideIcon } from "lucide-react";

/** Back link + title + meta chips for a single batch. */
export function BatchHeader({
  backHref,
  backLabel,
  title,
  meta,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  meta: (string | null | undefined)[];
}) {
  const chips = meta.filter((m): m is string => !!m && m.trim().length > 0);
  return (
    <header>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
      >
        ← {backLabel}
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold text-nm-navy">{title}</h1>
      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full border border-nm-border bg-white px-3 py-1 text-xs font-medium text-nm-muted"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}

/** Compact at-a-glance row. `tone` highlights anything needing attention. */
export function SummaryStrip({
  items,
}: {
  items: { label: string; value: string | number; tone?: "default" | "warn" | "good" }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((i) => (
        <div key={i.label} className="rounded-xl border border-nm-border bg-white px-4 py-3">
          <p
            className={`font-display text-xl font-bold tabular-nums ${
              i.tone === "warn"
                ? "text-amber-600"
                : i.tone === "good"
                  ? "text-teal-700"
                  : "text-nm-navy"
            }`}
          >
            {i.value}
          </p>
          <p className="mt-0.5 text-xs text-nm-muted">{i.label}</p>
        </div>
      ))}
    </div>
  );
}

/** A titled panel with an icon and an optional count on the right. */
export function SectionCard({
  icon: Icon,
  title,
  count,
  aside,
  children,
}: {
  icon: LucideIcon;
  title: string;
  count?: number;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-nm-border bg-white">
      <div className="flex items-center gap-3 border-b border-nm-border px-6 py-4">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Icon size={16} aria-hidden="true" />
        </span>
        <h2 className="font-semibold text-nm-navy">{title}</h2>
        {typeof count === "number" && count > 0 && (
          <span className="rounded-full bg-nm-surface px-2 py-0.5 text-xs font-semibold tabular-nums text-nm-muted">
            {count}
          </span>
        )}
        {aside && <div className="ml-auto">{aside}</div>}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

/**
 * Empty state that says what will appear here and who puts it there, instead
 * of a bare "Nothing yet."
 */
export function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
}) {
  return (
    <div className="py-8 text-center">
      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-nm-surface text-nm-muted">
        <Icon size={19} aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-nm-navy">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-sm text-sm text-nm-muted">{hint}</p>}
    </div>
  );
}
