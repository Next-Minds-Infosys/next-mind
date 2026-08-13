"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Markdown from "./Markdown";
import {
  Award,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Handshake,
  Minus,
  MonitorSmartphone,
  Phone,
  Plus,
  TriangleAlert,
  Wallet,
  Users,
} from "lucide-react";
import type { PublicCourse } from "@/db/queries";
import { contact, telHref } from "@/lib/contact";
import { npr } from "@/lib/utils";
import { colors, gradient, heroGradient } from "@/lib/theme";
import { publicMediaSrc } from "@/lib/media-image";
import { CourseStickyBar } from "./CourseStickyBar";
import EnrollModal from "./EnrollModal";

interface CoursePageContentProps {
  course: PublicCourse;
  courses: PublicCourse[];
}

/**
 * Body sections come from `contentMd`, which is authored as a series of `##`
 * headings. Splitting on them lets each one get real section chrome - a
 * coloured eyebrow and a heading in the page's own type scale - instead of
 * rendering as one undifferentiated wall of markdown.
 */
function splitContent(md: string) {
  if (!md?.trim()) return [];
  const parts = md.split(/^## +/m).filter((s) => s.trim());
  // Text before the first `##` has no heading of its own.
  const lead = md.trimStart().startsWith("## ") ? null : parts.shift() ?? null;
  const out = parts.map((chunk) => {
    const nl = chunk.indexOf("\n");
    return {
      heading: (nl === -1 ? chunk : chunk.slice(0, nl)).trim(),
      body: (nl === -1 ? "" : chunk.slice(nl + 1)).trim(),
    };
  });
  return lead ? [{ heading: "", body: lead.trim() }, ...out] : out;
}

/** Eyebrow label + colour for a body section, matched on its heading. */
function chromeFor(heading: string): { eyebrow: string; color: string } | null {
  const h = heading.toLowerCase();
  if (/career scope|salary/.test(h)) return { eyebrow: "Career & Salary", color: colors.orange };
  if (/fee|batch|payment|pricing/.test(h)) return { eyebrow: "Pricing & Schedule", color: colors.tealInk };
  if (/certification/.test(h)) return { eyebrow: "Certifications", color: colors.blueInk };
  if (/tools/.test(h)) return { eyebrow: "Toolkit", color: colors.blueInk };
  if (/project|lab/.test(h)) return { eyebrow: "Hands-on Work", color: colors.blueInk };
  if (/mistake/.test(h)) return { eyebrow: "From the Classroom", color: colors.orange };
  if (/what this course/.test(h)) return { eyebrow: "Course Overview", color: colors.tealInk };
  return null;
}

/** Which tab a body section scrolls under. */
function tabFor(heading: string) {
  const h = heading.toLowerCase();
  if (/career scope|salary/.test(h)) return "career";
  if (/fee|batch|payment|pricing|certification/.test(h)) return "pricing";
  if (/tools|project|lab/.test(h)) return "projects";
  return "overview";
}

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em]" style={{ color }}>
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl font-bold" style={{ color: colors.navy }}>
      {children}
    </h2>
  );
}


/* ---------------------------------------------------------------- body parts
 * The design renders parts of the markdown body as real components rather than
 * prose: tool cards, numbered project rows, role pills and callouts. The
 * authored markdown uses consistent shapes, so each block is classified once
 * and handed to the matching renderer; anything unrecognised stays markdown.
 */

/** `- **Name** — description` */
function parseDefList(block: string) {
  const out: { name: string; desc: string }[] = [];
  for (const line of block.split("\n")) {
    const m = line.match(/^-\s+\*\*(.+?)\*\*\s*[\u2014\u2013-]\s*(.+)$/);
    if (m) out.push({ name: m[1].trim(), desc: m[2].trim() });
  }
  return out;
}

/** Plain `- item` bullets (excluding the `- **Name** —` shape above). */
function parseBullets(block: string) {
  return block
    .split("\n")
    .map((l) => l.match(/^-\s+(?!\*\*)(.+)$/)?.[1]?.trim())
    .filter((x): x is string => !!x);
}

/** A single `**Label:** body` paragraph. */
function parseLabelled(block: string) {
  const m = block.trim().match(/^\*\*(.+?)\*\*\s*([\s\S]+)$/);
  return m ? { label: m[1].replace(/:$/, "").trim(), text: m[2].trim() } : null;
}

function ToolCards({ items }: { items: { name: string; desc: string }[] }) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {items.map((t) => (
        <div
          key={t.name}
          className="flex gap-3 rounded-xl border p-4"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <span
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: gradient }}
          >
            {t.name.charAt(0)}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold" style={{ color: colors.navy }}>{t.name}</span>
            <span className="mt-0.5 block text-xs leading-relaxed" style={{ color: colors.muted }}>{t.desc}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function NumberedRows({ items }: { items: string[] }) {
  return (
    <ol className="mt-5 space-y-2.5">
      {items.map((t, i) => (
        <li
          key={t}
          className="flex items-start gap-3 rounded-xl border p-4 text-sm leading-relaxed"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.body }}
        >
          <span
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: gradient }}
          >
            {i + 1}
          </span>
          <span className="min-w-0">{t}</span>
        </li>
      ))}
    </ol>
  );
}

function RolePills({ text }: { text: string }) {
  const roles = text.split(/,\s*/).map((r) => r.replace(/\.$/, "").trim()).filter(Boolean);
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {roles.map((r) => (
        <span
          key={r}
          className="rounded-full border px-3.5 py-1.5 text-sm"
          style={{ backgroundColor: colors.light, borderColor: `${colors.teal}55`, color: colors.tealInk }}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

function Callout({ label, text }: { label: string; text: string }) {
  return (
    <div
      className="mt-6 rounded-2xl border p-6"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <h3 className="mb-2 font-display text-base font-semibold" style={{ color: colors.navy }}>
        {label}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: colors.body }}>{text}</p>
    </div>
  );
}


/** Each `**Title.** body` paragraph becomes its own warning card. */
function MistakeCards({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const intro = blocks.filter((b) => !b.startsWith("**"));
  const items = blocks
    .map((b) => b.match(/^\*\*(.+?)\*\*\s*([\s\S]+)$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map((m) => ({ title: m[1].replace(/\.$/, ""), text: m[2].trim() }));

  return (
    <>
      {intro.map((t, i) => (
        <p key={i} className="mt-4 leading-relaxed" style={{ color: colors.body }}>{t}</p>
      ))}
      <div className="mt-6 space-y-3">
        {items.map((m) => (
          <div
            key={m.title}
            className="flex gap-4 rounded-xl border p-5"
            style={{ backgroundColor: "#fffaf2", borderColor: `${colors.orange}44` }}
          >
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: colors.orange }}
            >
              <TriangleAlert size={16} className="text-white" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h4 className="mb-1 text-sm font-semibold" style={{ color: colors.navy }}>{m.title}</h4>
              <p className="text-sm leading-relaxed" style={{ color: colors.body }}>{m.text}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** Price card + batches card, side by side, as in the design. */
function FeeBlock({
  body,
  price,
  duration,
  nextBatch,
  included,
}: {
  body: string;
  price: number;
  duration: string;
  nextBatch: string | null;
  included: string[];
}) {
  const batchLine = body.match(/\*\*Batch options:\*\*\s*(.+)/)?.[1] ?? "";
  const weekend = batchLine.match(/Weekend batch \(([^)]+)\)/i)?.[1];
  const evening = batchLine.match(/evening batch \(([^)]+)\)/i)?.[1];
  const emi = body.match(/\*\*EMI[^*]*\*\*\s*(.+)/)?.[1];

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border p-6" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className="font-display text-3xl font-bold" style={{ color: colors.navy }}>{npr(price)}</div>
        <div className="mt-1 text-sm" style={{ color: colors.muted }}>As of August 2026 · EMI available</div>
        <ul className="mt-5 space-y-2">
          {included.map((t) => (
            <li key={t} className="flex gap-2 text-sm leading-relaxed" style={{ color: colors.body }}>
              <Check size={15} className="mt-0.5 flex-shrink-0" style={{ color: colors.tealInk }} />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border p-6" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: colors.navy }}>Available Batches</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="font-semibold" style={{ color: colors.navy }}>Duration</dt>
            <dd style={{ color: colors.muted }}>{duration}</dd>
          </div>
          {weekend && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="font-semibold" style={{ color: colors.navy }}>Weekend Batch</dt>
              <dd className="text-right" style={{ color: colors.muted }}>{weekend}</dd>
            </div>
          )}
          {evening && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="font-semibold" style={{ color: colors.navy }}>Evening Batch</dt>
              <dd className="text-right" style={{ color: colors.muted }}>{evening}</dd>
            </div>
          )}
        </dl>
        {nextBatch && (
          <div
            className="mt-5 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold"
            style={{ backgroundColor: colors.light, color: colors.tealInk }}
          >
            <Calendar size={15} aria-hidden="true" />
            Next Batch: {nextBatch}
          </div>
        )}
        {emi && (
          <p className="mt-4 text-xs leading-relaxed" style={{ color: colors.muted }}>{emi}</p>
        )}
      </div>
    </div>
  );
}

/** Splits a section body into blocks and renders each with the right treatment. */
function SectionBody({ heading, body }: { heading: string; body: string }) {
  const isTools = /tools/i.test(heading);
  const isProjects = /project|lab/i.test(heading);

  return (
    <>
      {body.split(/\n{2,}/).map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (isTools) {
          const defs = parseDefList(trimmed);
          if (defs.length) return <ToolCards key={i} items={defs} />;
        }
        if (isProjects) {
          const bullets = parseBullets(trimmed);
          if (bullets.length >= 3) return <NumberedRows key={i} items={bullets} />;
        }

        const labelled = parseLabelled(trimmed);
        if (labelled && !trimmed.includes("\n")) {
          if (/^roles you can apply/i.test(labelled.label))
            return (
              <div key={i} className="mt-8">
                <h3 className="font-display text-base font-semibold" style={{ color: colors.navy }}>
                  Roles You Can Apply For After This Course
                </h3>
                <RolePills text={labelled.text} />
              </div>
            );
          if (labelled.label.endsWith("?"))
            return <Callout key={i} label={labelled.label} text={labelled.text} />;
        }

        return (
          <div key={i} className="mt-4">
            <Markdown>{trimmed}</Markdown>
          </div>
        );
      })}
    </>
  );
}

export default function CoursePageContent({ course, courses }: CoursePageContentProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [active, setActive] = useState("overview");

  const body = useMemo(() => splitContent(course.contentMd), [course.contentMd]);

  /**
   * The design's sidebar checklist is the real "what is included in the fee"
   * list, which lives in the pricing section of contentMd. Deriving it from
   * `tools` instead produced filler like "Hands-on practice with Canva".
   */
  const included = useMemo(() => {
    const fee = body.find((s) => /fee|included/i.test(s.heading));
    if (!fee) return [];
    const after = fee.body.split(/what is included[^\n]*\n/i)[1];
    if (!after) return [];
    return after
      .split(/\n{2,}/)[0]
      .split("\n")
      .map((l) => l.match(/^-\s+(.+)$/)?.[1]?.trim())
      .filter((x): x is string => !!x);
  }, [body]);
  const mentorPhoto = course.mentor ? publicMediaSrc(course.mentor.photo) : null;

  const tabs = useMemo(() => {
    const t = [
      { id: "overview", label: "Overview" },
      { id: "audience", label: "Who It's For" },
      { id: "curriculum", label: "Curriculum" },
      { id: "projects", label: "Tools & Projects" },
      { id: "career", label: "Career Scope" },
      { id: "faq", label: "FAQ" },
    ];
    return t.filter((x) => {
      if (x.id === "career" || x.id === "projects")
        return body.some((s) => tabFor(s.heading) === x.id);
      if (x.id === "faq") return course.faqs.length > 0;
      return true;
    });
  }, [body, course.faqs.length]);

  // Scroll spy for the tab strip.
  useEffect(() => {
    const onScroll = () => {
      let current = tabs[0]?.id ?? "overview";
      for (const t of tabs) {
        const el = document.getElementById(t.id);
        if (el && el.getBoundingClientRect().top <= 180) current = t.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tabs]);

  /**
   * The design splits the H1: the trailing clause is teal. `h1Accent` must be a
   * suffix of `h1`, so the lead is everything before it. Falls back to the card
   * title when no editorial H1 has been written yet.
   */
  const headline = useMemo(() => {
    const full = course.h1?.trim() || course.title;
    const accent = course.h1Accent?.trim();
    if (accent && full.endsWith(accent)) {
      return { lead: full.slice(0, full.length - accent.length), accent };
    }
    return { lead: full, accent: "" };
  }, [course.h1, course.h1Accent, course.title]);

  const specs = [
    { icon: Clock, label: "Duration", value: course.duration },
    { icon: BarChart3, label: "Level", value: course.level },
    { icon: MonitorSmartphone, label: "Format", value: "Online & In-Person" },
    { icon: Award, label: "Certificate", value: "Included" },
    { icon: Handshake, label: "Placement", value: "Support Included" },
  ];

  const facts = [
    { icon: Clock, label: "Duration", value: course.duration },
    { icon: Wallet, label: "Fee", value: npr(course.price) },
    { icon: MonitorSmartphone, label: "Format", value: "Online + In-Person" },
    // Only shown once a real intake is set - never a placeholder.
    ...(course.nextBatch ? [{ icon: Calendar, label: "Next Batch", value: course.nextBatch }] : []),
    { icon: BarChart3, label: "Level", value: course.level },
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative px-6 pt-28 pb-0" style={{ background: heroGradient }}>
        <div className="mx-auto grid max-w-7xl gap-10 pb-14 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/55">
              <Link href="/" className="transition-colors hover:text-white">Home</Link>
              <span>/</span>
              <Link href="/courses" className="transition-colors hover:text-white">Courses</Link>
              <span>/</span>
              <span className="text-white/90">{course.title}</span>
            </nav>

            <div className="mb-5 flex flex-wrap gap-2">
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: `${colors.teal}22`, color: colors.teal, border: `1px solid ${colors.teal}55` }}
              >
                {course.category}
              </span>
              {course.badge && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: `${colors.teal}22`, color: colors.teal, border: `1px solid ${colors.teal}55` }}
                >
                  {course.badge}
                </span>
              )}
            </div>

            <h1
              className="font-display font-bold leading-[1.12] text-white"
              style={{ fontSize: "clamp(2rem,4vw,2.8rem)" }}
            >
              {headline.lead}
              {headline.accent && (
                <span style={{ color: colors.teal }}>{headline.accent}</span>
              )}
            </h1>

            <p className="mt-5 max-w-2xl leading-relaxed text-white/70">{course.description}</p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {facts.map((f) => (
                <span
                  key={f.label}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.07] px-3.5 py-2 text-sm text-white/60"
                >
                  <f.icon size={14} aria-hidden="true" />
                  {f.label}: <strong className="font-semibold text-white">{f.value}</strong>
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="min-h-[48px] rounded-xl px-8 py-3.5 text-base font-bold text-white transition-all active:scale-95"
                style={{ background: gradient, boxShadow: `0 6px 24px ${colors.teal}45` }}
              >
                Enroll Now
              </button>
              {course.syllabusUrl && (
                <a
                  href={course.syllabusUrl}
                  className="min-h-[48px] inline-flex items-center gap-2 rounded-xl border border-white/25 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  <FileText size={17} aria-hidden="true" />
                  Download Syllabus
                </a>
              )}
              <Link
                href="/contact"
                className="min-h-[48px] inline-flex items-center gap-2 rounded-xl border border-white/25 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
              >
                <Phone size={17} aria-hidden="true" />
                Book Free Counselling
              </Link>
            </div>
          </div>

          {/* Sticky pricing card */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div
              className="overflow-hidden rounded-2xl bg-white"
              style={{ boxShadow: "0 24px 64px rgba(6,26,46,0.28)" }}
            >
              <div className="h-1.5" style={{ background: gradient }} />
              <div className="p-6">
                <h2 className="font-display text-lg font-bold" style={{ color: colors.navy }}>
                  {course.title}
                </h2>

                {/* Specs read as "Label: value" on one line rather than a
                    justified table - shorter card, and the value stays next to
                    the thing it describes. */}
                <dl className="mt-4 space-y-2.5">
                  {specs.map((sp) => (
                    <div key={sp.label} className="flex items-start gap-2.5 text-sm">
                      <sp.icon
                        size={16}
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: colors.tealInk }}
                        aria-hidden="true"
                      />
                      <dt style={{ color: colors.muted }}>{sp.label}:</dt>
                      <dd className="font-semibold" style={{ color: colors.navy }}>{sp.value}</dd>
                    </div>
                  ))}
                  {course.nextBatch && (
                    <div className="flex items-start gap-2.5 text-sm">
                      <Calendar
                        size={16}
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: colors.tealInk }}
                        aria-hidden="true"
                      />
                      <dt style={{ color: colors.muted }}>Next batch:</dt>
                      <dd className="font-semibold" style={{ color: colors.navy }}>{course.nextBatch}</dd>
                    </div>
                  )}
                </dl>

                <hr className="my-5 border-0 border-t" style={{ borderColor: colors.border }} />

                <div className="font-display text-3xl font-bold" style={{ color: colors.tealInk }}>
                  {npr(course.price)}
                </div>
                <div className="mt-1 text-sm" style={{ color: colors.muted }}>
                  One-time payment · EMI available
                </div>

                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="mt-5 min-h-[48px] w-full rounded-full py-3.5 font-bold text-white transition-all active:scale-95"
                  style={{ background: gradient }}
                >
                  Enroll now
                </button>

                {course.syllabusUrl ? (
                  <a
                    href={course.syllabusUrl}
                    className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border-[1.5px] font-semibold transition-all hover:bg-nm-surface"
                    style={{ borderColor: colors.teal, color: colors.tealInk }}
                  >
                    <FileText size={16} aria-hidden="true" />
                    Get syllabus (PDF)
                  </a>
                ) : (
                  <Link
                    href="/contact"
                    className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-full border-[1.5px] font-semibold transition-all hover:bg-nm-surface"
                    style={{ borderColor: colors.teal, color: colors.tealInk }}
                  >
                    Book free counselling
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------------- tabs */}
      <div
        className="sticky top-16 z-30 border-b bg-white/95 px-6 backdrop-blur"
        style={{ borderColor: colors.border }}
      >
        <div className="mx-auto flex max-w-7xl gap-7 overflow-x-auto">
          {tabs.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="whitespace-nowrap border-b-2 py-4 text-sm font-semibold transition-colors"
              style={{
                borderColor: active === t.id ? colors.teal : "transparent",
                color: active === t.id ? colors.tealInk : colors.muted,
              }}
            >
              {t.label}
            </a>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- content */}
      <div className="px-6 py-14" style={{ backgroundColor: colors.bg }}>
        <div className="mx-auto max-w-3xl space-y-16">
          {/* Overview + skills */}
          <section id="overview" className="scroll-mt-32">
            <Eyebrow color={colors.tealInk}>Course Overview</Eyebrow>
            <SectionHeading>What This Course Is</SectionHeading>
            {body
              .filter((s) => tabFor(s.heading) === "overview")
              .map((s, i) => (
                <div key={i} className="mt-5">
                  {s.heading && !/what this course/i.test(s.heading) && (
                    <h3 className="mb-3 mt-8 font-display text-xl font-bold" style={{ color: colors.navy }}>
                      {s.heading}
                    </h3>
                  )}
                  <SectionBody heading={s.heading} body={s.body} />
                </div>
              ))}

            {course.skills.length > 0 && (
              <div
                className="mt-10 rounded-2xl border p-6"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <h3 className="mb-5 font-display text-lg font-semibold" style={{ color: colors.navy }}>
                  What You Will Be Able to Do After This Course
                </h3>
                <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {course.skills.map((s) => (
                    <li key={s} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: colors.body }}>
                      <Check size={15} className="mt-1 flex-shrink-0" style={{ color: colors.tealInk }} />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Who it's for */}
          {course.whoIsItFor.length > 0 && (
            <section id="audience" className="scroll-mt-32">
              <Eyebrow color={colors.blueInk}>Target Audience</Eyebrow>
              <SectionHeading>{`Who Is This ${course.title} Course For?`}</SectionHeading>
              <div className="mt-6 space-y-3">
                {course.whoIsItFor.map((w, i) => {
                  const [head, ...rest] = w.split(/ (?:who|whose|moving|adding|switching|looking) /);
                  return (
                    <div
                      key={w}
                      className="flex gap-4 rounded-xl border bg-white p-5"
                      style={{ borderColor: colors.border }}
                    >
                      <span
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: gradient }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed" style={{ color: colors.body }}>
                        {rest.length ? (
                          <>
                            <strong style={{ color: colors.navy }}>{head}</strong>
                            {w.slice(head.length)}
                          </>
                        ) : (
                          w
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Curriculum */}
          {course.curriculum.length > 0 && (
            <section id="curriculum" className="scroll-mt-32">
              <Eyebrow color={colors.tealInk}>Full Curriculum</Eyebrow>
              <div className="flex items-end justify-between gap-4">
                <SectionHeading>What You Will Learn</SectionHeading>
                <span className="whitespace-nowrap text-sm" style={{ color: colors.muted }}>
                  {course.curriculum.length} modules
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {course.curriculum.map((m, i) => {
                  const open = openModule === i;
                  return (
                    <div
                      key={m.title}
                      className="overflow-hidden rounded-xl border bg-white"
                      style={{ borderColor: colors.border }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenModule(open ? null : i)}
                        aria-expanded={open}
                        className="flex w-full items-center gap-4 p-5 text-left"
                      >
                        <span
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                          style={{ background: gradient }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold" style={{ color: colors.navy }}>
                            {m.title}
                          </span>
                          <span className="block text-xs" style={{ color: colors.muted }}>
                            {m.topics.length} topics
                          </span>
                        </span>
                        <ChevronDown
                          size={18}
                          className="flex-shrink-0 transition-transform"
                          style={{ color: colors.tealInk, transform: open ? "rotate(180deg)" : "none" }}
                          aria-hidden="true"
                        />
                      </button>
                      {open && (
                        <ul
                          className="grid gap-x-6 gap-y-2.5 border-t px-5 py-5 sm:grid-cols-2"
                          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                        >
                          {m.topics.map((t) => (
                            <li key={t} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: colors.body }}>
                              <Check size={14} className="mt-1 flex-shrink-0" style={{ color: colors.tealInk }} />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Tools & projects (from contentMd) */}
          {body.some((s) => tabFor(s.heading) === "projects") && (
            <section id="projects" className="scroll-mt-32">
              <Eyebrow color={colors.blueInk}>Hands-on Practice</Eyebrow>
              <SectionHeading>Tools You Will Get Hands-On Practice With</SectionHeading>

              {body
                .filter((s) => tabFor(s.heading) === "projects")
                .map((s, i) => (
                  <div key={i} className="mt-8">
                    <h3 className="mb-3 font-display text-xl font-bold" style={{ color: colors.navy }}>
                      {s.heading}
                    </h3>
                    <SectionBody heading={s.heading} body={s.body} />
                  </div>
                ))}
            </section>
          )}

          {/* Career & salary */}
          {body.some((s) => tabFor(s.heading) === "career") && (
            <section id="career" className="scroll-mt-32">
              {body
                .filter((s) => tabFor(s.heading) === "career")
                .map((s, i) => {
                  const c = chromeFor(s.heading);
                  return (
                    <div key={i} className={i ? "mt-10" : ""}>
                      {c && <Eyebrow color={c.color}>{c.eyebrow}</Eyebrow>}
                      <SectionHeading>{s.heading}</SectionHeading>
                      <div className="mt-5">
                        <SectionBody heading={s.heading} body={s.body} />
                      </div>
                    </div>
                  );
                })}
            </section>
          )}

          {/* Mentor */}
          {course.mentor && (
            <section id="mentor" className="scroll-mt-32">
              <Eyebrow color={colors.tealInk}>Your Instructor</Eyebrow>
              <SectionHeading>Who You Will Learn From</SectionHeading>
              <div
                className="mt-6 flex flex-col gap-6 rounded-2xl border bg-white p-6 sm:flex-row"
                style={{ borderColor: colors.border }}
              >
                <div
                  className="relative flex w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-xl text-white sm:w-[150px]"
                  style={{ aspectRatio: "3 / 4", background: gradient }}
                >
                  {mentorPhoto ? (
                    <Image src={mentorPhoto} alt={course.mentor.name} fill sizes="150px" className="object-cover" />
                  ) : (
                    <Users size={56} aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl font-bold" style={{ color: colors.navy }}>
                    {course.mentor.name}
                  </h3>
                  <div className="mb-3 text-sm font-medium" style={{ color: colors.tealInk }}>
                    {course.mentor.role}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: colors.body }}>
                    {course.mentor.bio}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Pricing, certifications, mistakes */}
          {body.some((s) => tabFor(s.heading) === "pricing") && (
            <section id="pricing" className="scroll-mt-32">
              {body
                .filter((s) => tabFor(s.heading) === "pricing")
                .map((s, i) => {
                  const c = chromeFor(s.heading);
                  return (
                    <div key={i} className={i ? "mt-10" : ""}>
                      {c && <Eyebrow color={c.color}>{c.eyebrow}</Eyebrow>}
                      <SectionHeading>{s.heading}</SectionHeading>
                      {/^course fee/i.test(s.heading) ? (
                        <FeeBlock
                          body={s.body}
                          price={course.price}
                          duration={course.duration}
                          nextBatch={course.nextBatch}
                          included={included}
                        />
                      ) : (
                        <div className="mt-5">
                          <SectionBody heading={s.heading} body={s.body} />
                        </div>
                      )}
                    </div>
                  );
                })}
            </section>
          )}

          {/* Common mistakes — rendered with a warning treatment */}
          {body
            .filter((s) => /mistake/i.test(s.heading))
            .map((s, i) => (
              <section key={i} className="scroll-mt-32">
                <Eyebrow color={colors.orange}>From the Classroom</Eyebrow>
                <SectionHeading>{s.heading}</SectionHeading>
                <MistakeCards body={s.body} />
              </section>
            ))}

          {/* FAQ */}
          {course.faqs.length > 0 && (
            <section id="faq" className="scroll-mt-32">
              <Eyebrow color={colors.blueInk}>FAQ</Eyebrow>
              <SectionHeading>Frequently Asked Questions</SectionHeading>
              <div className="mt-6 space-y-3">
                {course.faqs.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div
                      key={f.q}
                      className="overflow-hidden rounded-xl border bg-white"
                      style={{ borderColor: colors.border }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? null : i)}
                        aria-expanded={open}
                        className="flex w-full items-center gap-4 p-5 text-left"
                      >
                        <span className="flex-1 text-sm font-semibold" style={{ color: colors.navy }}>
                          {f.q}
                        </span>
                        {open ? (
                          <Minus size={17} className="flex-shrink-0" style={{ color: colors.tealInk }} aria-hidden="true" />
                        ) : (
                          <Plus size={17} className="flex-shrink-0" style={{ color: colors.tealInk }} aria-hidden="true" />
                        )}
                      </button>
                      {open && (
                        <div
                          className="border-t px-5 py-4 text-sm leading-relaxed"
                          style={{ borderColor: colors.border, color: colors.body, backgroundColor: colors.surface }}
                        >
                          {f.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Final CTA */}
          <section className="rounded-2xl p-8" style={{ background: heroGradient }}>
            <h2 className="font-display text-2xl font-bold text-white">Ready to Start?</h2>
            <p className="mt-3 max-w-xl leading-relaxed text-white/70">
              Talk to a course advisor before you enroll. A free 30-minute counselling session will
              help you decide whether this course fits your goals, which batch timing works, and what
              payment option makes sense.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="min-h-[48px] rounded-xl px-7 py-3.5 font-bold text-white transition-all active:scale-95"
                style={{ background: gradient }}
              >
                Enroll Now
              </button>
              <Link
                href="/contact"
                className="min-h-[48px] inline-flex items-center rounded-xl border border-white/25 px-7 py-3.5 font-semibold text-white transition-all hover:bg-white/10"
              >
                Book Free Counselling
              </Link>
              <a
                href={telHref}
                className="min-h-[48px] inline-flex items-center gap-2 rounded-xl border border-white/25 px-7 py-3.5 font-semibold text-white transition-all hover:bg-white/10"
              >
                <Phone size={16} aria-hidden="true" />
                {contact.phoneDisplay}
              </a>
            </div>
          </section>

          {/* Related */}
          {courses.length > 1 && (
            <section>
              <Eyebrow color={colors.tealInk}>Keep Exploring</Eyebrow>
              <SectionHeading>Other Courses at Next Minds</SectionHeading>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {courses
                  .filter((c) => c.slug !== course.slug)
                  .slice(0, 4)
                  .map((c) => (
                    <Link
                      key={c.slug}
                      href={`/courses/${c.slug}`}
                      className="rounded-xl border bg-white p-4 transition-all hover:shadow-md"
                      style={{ borderColor: colors.border }}
                    >
                      <div className="font-semibold" style={{ color: colors.navy }}>{c.title}</div>
                      <div className="mt-1 text-xs" style={{ color: colors.muted }}>
                        {c.duration} · {npr(c.price)}
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <CourseStickyBar price={course.price} onEnroll={() => setModalOpen(true)} />
      <EnrollModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        courses={courses}
        preSelectedCourse={course.title}
      />
    </>
  );
}
