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


/* ------------------------------------------------------ batch page chrome */

/** Small pill under the batch title: code, course, roster size. */
export function Chip({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "teal";
}) {
  const cls =
    tone === "teal"
      ? "bg-teal-50 text-teal-700"
      : "bg-nm-surface text-nm-muted";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{children}</span>
  );
}

/**
 * Stat tile with a leading dot. The dot turns amber when the number is
 * something the reader has to act on - work awaiting grading, assignments
 * still to submit - so the row can be scanned without reading the labels.
 */
export function StatCard({
  value,
  label,
  attention = false,
  href,
}: {
  value: string | number;
  label: string;
  attention?: boolean;
  /** Optional drill-down; the tile becomes a link when set. */
  href?: string;
}) {
  const body = (
    <div className="h-full rounded-xl border border-nm-border bg-white px-5 py-4 transition hover:border-teal-500/40">
      <div className="flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${attention ? "bg-amber-500" : "bg-teal-500"}`}
          aria-hidden="true"
        />
        <span className="font-display text-2xl font-bold tabular-nums text-nm-navy">{value}</span>
      </div>
      <p className="mt-1 text-sm text-nm-muted">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

/** Initials avatar for message threads. */
export function Avatar({ name, tone = "dark" }: { name: string; tone?: "dark" | "light" }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        tone === "dark" ? "bg-nm-navy text-white" : "bg-teal-100 text-teal-800"
      }`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

/** "2 days ago" - the design labels messages relatively, not with a timestamp. */
export function relativeTime(d: Date | string | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return fmtDate(date);
}

/** White card used for each block inside a tab panel. */
export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-nm-border bg-white">
      {children}
    </section>
  );
}

/** Heading row inside a Panel. */
export function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-nm-border px-6 py-4 font-semibold text-nm-navy">{children}</h2>
  );
}
