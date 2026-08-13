"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Markdown from "./Markdown";
import {
  Award,
  BarChart3,
  Check,
  ChevronDown,
  Clock,
  Handshake,
  Minus,
  MonitorSmartphone,
  Phone,
  Plus,
  TriangleAlert,
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
  if (/project|lab/.test(h)) return { eyebrow: "Hands-on Work", color: colors.green };
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

export default function CoursePageContent({ course, courses }: CoursePageContentProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [active, setActive] = useState("overview");

  const body = useMemo(() => splitContent(course.contentMd), [course.contentMd]);
  const mentorPhoto = course.mentor ? publicMediaSrc(course.mentor.photo) : null;

  const tabs = useMemo(() => {
    const t = [
      { id: "overview", label: "Overview" },
      { id: "audience", label: "Who It's For" },
      { id: "curriculum", label: "Curriculum" },
      { id: "projects", label: "Tools & Projects" },
      { id: "career", label: "Career Scope" },
      { id: "pricing", label: "Pricing" },
      { id: "faq", label: "FAQ" },
    ];
    return t.filter((x) => {
      if (x.id === "career" || x.id === "pricing" || x.id === "projects")
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

  const specs = [
    { icon: Clock, label: "Duration", value: course.duration },
    { icon: BarChart3, label: "Level", value: course.level },
    { icon: MonitorSmartphone, label: "Format", value: "Online & In-Person" },
    { icon: Award, label: "Certificate", value: "Included" },
    { icon: Handshake, label: "Placement", value: "Support Included" },
  ];

  const facts = [
    { label: "Duration", value: course.duration },
    { label: "Fee", value: npr(course.price) },
    { label: "Format", value: "Online + In-Person" },
    { label: "Level", value: course.level },
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
                style={{ backgroundColor: `${colors.green}22`, color: colors.green, border: `1px solid ${colors.green}55` }}
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
              {course.metaTitle?.split("|")[0]?.trim() || course.title}
            </h1>

            <p className="mt-5 max-w-2xl leading-relaxed text-white/70">{course.description}</p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {facts.map((f) => (
                <span
                  key={f.label}
                  className="rounded-lg border border-white/15 bg-white/[0.07] px-3.5 py-2 text-sm text-white/60"
                >
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
              <Link
                href="/contact"
                className="min-h-[48px] inline-flex items-center rounded-xl border border-white/25 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
              >
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
                <div className="font-display text-3xl font-bold" style={{ color: colors.navy }}>
                  {npr(course.price)}
                </div>
                <div className="mt-1 text-sm" style={{ color: colors.muted }}>
                  One-time payment · EMI available
                </div>

                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="mt-5 min-h-[48px] w-full rounded-xl py-3.5 font-bold text-white transition-all active:scale-95"
                  style={{ background: gradient }}
                >
                  Enroll Now
                </button>
                <Link
                  href="/contact"
                  className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-xl border py-3.5 font-semibold transition-all hover:bg-nm-surface"
                  style={{ borderColor: colors.border, color: colors.navy }}
                >
                  Book Free Counselling
                </Link>

                <dl className="mt-6 space-y-3">
                  {specs.map((s) => (
                    <div key={s.label} className="flex items-center justify-between gap-3 text-sm">
                      <dt className="flex items-center gap-2" style={{ color: colors.muted }}>
                        <s.icon size={15} className="text-nm-teal-ink" aria-hidden="true" />
                        {s.label}
                      </dt>
                      <dd className="font-semibold" style={{ color: colors.navy }}>{s.value}</dd>
                    </div>
                  ))}
                </dl>

                {course.skills.length > 0 && (
                  <div className="mt-6 border-t pt-5" style={{ borderColor: colors.border }}>
                    <div
                      className="mb-3 text-xs font-bold uppercase tracking-[0.14em]"
                      style={{ color: colors.tealInk }}
                    >
                      What&apos;s included
                    </div>
                    <ul className="space-y-2">
                      {course.tools.slice(0, 6).map((t) => (
                        <li key={t} className="flex gap-2 text-sm" style={{ color: colors.body }}>
                          <Check size={15} className="mt-0.5 flex-shrink-0" style={{ color: colors.green }} />
                          <span>Hands-on practice with {t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                  <Markdown>{s.body}</Markdown>
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
              <SectionHeading>Who Is This Course For?</SectionHeading>
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
              <Eyebrow color={colors.green}>Full Curriculum</Eyebrow>
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
              <Eyebrow color={colors.blueInk}>Toolkit &amp; Hands-on Work</Eyebrow>
              <SectionHeading>Tools You Will Use, Projects You Will Ship</SectionHeading>

              {course.tools.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {course.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg border px-3 py-1.5 text-sm font-medium"
                      style={{ borderColor: colors.border, backgroundColor: "#fff", color: colors.navy }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {body
                .filter((s) => tabFor(s.heading) === "projects")
                .map((s, i) => (
                  <div key={i} className="mt-8">
                    <h3 className="mb-3 font-display text-xl font-bold" style={{ color: colors.navy }}>
                      {s.heading}
                    </h3>
                    <Markdown>{s.body}</Markdown>
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
                        <Markdown>{s.body}</Markdown>
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
                      <div className="mt-5">
                        <Markdown>{s.body}</Markdown>
                      </div>
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
                <div
                  className="mt-6 rounded-2xl border p-6"
                  style={{ backgroundColor: "#fffaf2", borderColor: `${colors.orange}44` }}
                >
                  <div className="flex gap-3">
                    <TriangleAlert
                      size={18}
                      className="mt-1 flex-shrink-0"
                      style={{ color: colors.orange }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <Markdown>{s.body}</Markdown>
                    </div>
                  </div>
                </div>
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
