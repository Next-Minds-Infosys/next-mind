"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { testimonials } from "@/data/courses";
import type { PublicCourse } from "@/db/queries";
import { stats } from "@/lib/stats";
import { colors, gradient, heroGradient } from "@/lib/theme";
import EnrollModal from "./EnrollModal";
import { Briefcase, GraduationCap, Handshake, Rocket, Star, Target, UserCog, UserRound, Zap } from "lucide-react";

const tools = [
  "React",
  "Node.js",
  "Python",
  "AWS",
  "Docker",
  "Figma",
  "Kubernetes",
  "MongoDB",
  "TypeScript",
  "TensorFlow",
  "Google Ads",
  "Selenium",
  "Kali Linux",
  "Jenkins",
  "Next.js",
  "PostgreSQL",
];

const rotatingWords = [
  "Full Stack",
  "Digital Marketing",
  "Cyber Security",
  "DevOps",
  "Data Science",
  "UI/UX Design",
];

const heroStats: [string, string][] = [
  [stats.studentsTrained, "Students Trained"],
  [stats.placementRate, "Placement Rate"],
  [stats.hiringPartners, "Hiring Partners"],
];

const stripStats = [
  { n: stats.studentsTrained, l: "Students Trained", icon: GraduationCap, c: colors.teal },
  { n: stats.placementRate, l: "Placement Rate", icon: Briefcase, c: colors.blue },
  { n: stats.hiringPartners, l: "Hiring Partners", icon: Handshake, c: colors.green },
  { n: stats.instructors, l: "Expert Instructors", icon: UserCog, c: "#f4a44a" },
];

const processSteps = [
  {
    icon: Target,
    title: "Choose Your Course",
    desc: "Browse programs and book a free 30-min counselling session with our advisors.",
  },
  {
    icon: Zap,
    title: "Learn & Build",
    desc: "Live classes, real-world projects, and mentorship from active industry professionals.",
  },
  {
    icon: Rocket,
    title: "Get Placed",
    desc: "Strong portfolio, interview prep, and direct referrals to our 50+ hiring partners.",
  },
];

function Hero({ courses }: { courses: PublicCourse[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % rotatingWords.length);
        setVisible(true);
      }, 320);
    }, 2800);
    return () => clearInterval(id);
  }, []);



  return (
    <section className="relative overflow-hidden pt-16" style={{ backgroundColor: colors.bg }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: gradient }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: `radial-gradient(circle, ${colors.blue}, transparent)` }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(${colors.teal} 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-[1fr_460px] gap-16 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold mb-8"
              style={{
                backgroundColor: `${colors.green}15`,
                border: `1px solid ${colors.green}40`,
                color: colors.green,
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: colors.green }}
              />
              {`New Batches Starting ${nextIntakeLabel()} — Limited Seats`}
            </div>

            <h1
              className="font-display font-bold leading-[1.05] mb-6"
              style={{ fontSize: "clamp(2.6rem,5vw,4.5rem)", color: colors.navy }}
            >
              Learn{" "}
              <span
                className="inline-block transition-all duration-300"
                style={{
                  color: colors.teal,
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(8px)",
                }}
              >
                {rotatingWords[index]}
              </span>
              <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: gradient }}>
                Lead Tomorrow
              </span>
            </h1>

            <p
              className="text-lg leading-relaxed mb-10 max-w-[520px]"
              style={{ color: colors.body }}
            >
              Where your ambition meets opportunities. Nepal&apos;s most career-focused IT training
              institute — in-person at New Baneshwor and live online.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link
                href="/courses"
                className="min-h-[48px] inline-flex items-center rounded-xl border-[1.5px] border-nm-teal px-9 py-4 text-base font-semibold text-nm-teal-ink transition-all hover:bg-nm-teal/10 active:scale-95"
              >
                Explore courses
              </Link>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="min-h-[48px] rounded-xl px-9 py-4 text-base font-bold text-white transition-all active:scale-95"
                style={{ background: gradient, boxShadow: `0 6px 24px ${colors.teal}40` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.teal;
                  e.currentTarget.style.color = colors.teal;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.navy;
                }}
              >
                Book free counselling
              </button>
            </div>

            <div className="flex flex-wrap gap-10">
              {heroStats.map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-3xl font-bold" style={{ color: colors.navy }}>
                    {n}
                  </div>
                  <div className="text-xs tracking-wide mt-0.5" style={{ color: colors.muted }}>
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                height: "520px",
                border: `1px solid ${colors.border}`,
                boxShadow: "0 24px 64px rgba(13,45,82,0.12)",
              }}
            >
              <Image
                src="/assets/hero-campus.jpg"
                alt="Students collaborating at Next Minds campus"
                fill
                priority
                sizes="460px"
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(13,45,82,0.2) 0%, transparent 60%)",
                }}
              />
            </div>



            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-5 rounded-full px-5 py-2.5 flex items-center gap-3"
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                boxShadow: "0 4px 20px rgba(13,45,82,0.10)",
              }}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} aria-hidden="true" className="fill-warning text-warning" />
                ))}
              </div>
              <span className="text-sm font-semibold" style={{ color: colors.navy }}>
                4.9
              </span>
              <span className="text-xs" style={{ color: colors.muted }}>
                from 200+ reviews
              </span>
            </div>
          </div>
        </div>
      </div>

      <EnrollModal isOpen={modalOpen} onClose={() => setModalOpen(false)} courses={courses} />
    </section>
  );
}

function ToolsMarquee() {
  return (
    <div
      className="border-y overflow-hidden select-none py-3.5"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div
        className="flex gap-12 whitespace-nowrap"
        style={{ animation: "marquee 28s linear infinite" }}
      >
        {[...tools, ...tools].map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="text-sm font-medium flex-shrink-0 flex items-center gap-4"
            style={{ color: colors.muted }}
          >
            <span style={{ color: colors.teal }}>◆</span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function PopularCourses({ courses }: { courses: PublicCourse[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [preselect, setPreselect] = useState("");
  // Every published course, not the 6 newest. The old `slice(0, 6)` combined
  // with an `ORDER BY createdAt DESC` in getPublicCourses meant whichever
  // courses happened to be created last won the homepage slots - which is why
  // Digital Marketing, Advanced SEO and Full Stack were silently missing from
  // it despite being live on /courses. Nine courses fill three clean rows on
  // the 3-column grid, and each one gets an internal link from the homepage.
  const popular = courses;

  return (
    <section className="py-20 px-6" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <div
              className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
              style={{ color: colors.teal }}
            >
              Our Courses
            </div>
            <h2
              className="font-display text-3xl lg:text-4xl font-bold"
              style={{ color: colors.navy }}
            >
              Find Your Path to a{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: gradient }}>
                Future-Proof Career
              </span>
            </h2>
          </div>
          <Link
            href="/courses"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold whitespace-nowrap transition-colors"
            style={{ color: colors.teal }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.blue;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.teal;
            }}
          >
            View all Courses →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popular.map((course) => (
            <div
              key={course.id}
              className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
              style={{
                backgroundColor: colors.card,
                border: `1px solid ${colors.border}`,
                boxShadow: "0 2px 8px rgba(13,45,82,0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${course.color}50`;
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(13,45,82,0.10)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(13,45,82,0.05)";
              }}
            >
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full border"
                      style={{
                        color: course.color,
                        borderColor: `${course.color}40`,
                        backgroundColor: `${course.color}10`,
                      }}
                    >
                      {course.category}
                    </span>
                  </div>
                </div>
                <h3
                  className="font-display font-bold text-base leading-snug mb-2"
                  style={{ color: colors.navy }}
                >
                  {course.title}
                </h3>
                <p className="text-xs leading-relaxed mb-4" style={{ color: colors.muted }}>
                  {course.shortDesc}
                </p>
                <div className="flex gap-1 flex-wrap">
                  {course.tools.slice(0, 4).map((tool) => (
                    <span
                      key={tool}
                      className="text-[10px] px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: colors.surface,
                        color: colors.muted,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className="px-5 pb-5 flex items-center justify-between pt-4 border-t"
                style={{ borderColor: colors.border }}
              >
                <div className="text-sm font-bold" style={{ color: colors.navy }}>
                  NPR {course.price.toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                    style={{ border: `1px solid ${colors.border}`, color: colors.navy }}
                  >
                    Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setPreselect(course.title);
                      setModalOpen(true);
                    }}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all"
                    style={{ background: gradient }}
                  >
                    Enroll Now →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 font-semibold px-8 py-3 rounded-xl transition-all"
            style={{ border: `1.5px solid ${colors.border}`, color: colors.navy }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.teal;
              e.currentTarget.style.color = colors.teal;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.color = colors.navy;
            }}
          >
            Browse All Courses →
          </Link>
        </div>
      </div>

      <EnrollModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preSelectedCourse={preselect}
        courses={courses}
      />
    </section>
  );
}

function StatsStrip() {
  return (
    <section
      className="py-16 px-6 border-y"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stripStats.map((s) => (
          <div key={s.l} className="text-center group">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${s.c}12` }}
            >
              <s.icon size={26} aria-hidden="true" className="text-nm-teal-ink" />
            </div>
            <div className="font-display text-4xl font-bold mb-1" style={{ color: s.c }}>
              {s.n}
            </div>
            <div className="text-sm font-medium" style={{ color: colors.muted }}>
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const [perView, setPerView] = useState(3);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const pageCount = Math.max(1, Math.ceil(testimonials.length / perView));
  const current = Math.min(page, pageCount - 1);

  useEffect(() => {
    const id = setInterval(() => setPage((p) => (p + 1) % pageCount), 6000);
    return () => clearInterval(id);
  }, [pageCount]);

  const go = (dir: number) => setPage((p) => (p + dir + pageCount) % pageCount);

  return (
    <section className="py-20 px-6" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <div
              className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
              style={{ color: colors.green }}
            >
              Student Stories
            </div>
            <h2
              className="font-display text-3xl lg:text-4xl font-bold"
              style={{ color: colors.navy }}
            >
              What Our Students Say
            </h2>
          </div>
          <Link
            href="/testimonials"
            className="hidden sm:block text-sm font-semibold"
            style={{ color: colors.teal }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.blue;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.teal;
            }}
          >
            View All →
          </Link>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {testimonials.map((t, i) => {
                const highlight = i % perView === 1;
                return (
                  <div
                    key={t.name}
                    className="flex-shrink-0 px-2.5"
                    style={{ width: `${100 / perView}%` }}
                  >
                    <div
                      className="rounded-2xl p-6 flex flex-col h-full"
                      style={{
                        backgroundColor: colors.card,
                        border: `1px solid ${highlight ? `${colors.teal}50` : colors.border}`,
                        boxShadow: highlight
                          ? `0 8px 40px ${colors.teal}12`
                          : "0 2px 12px rgba(13,45,82,0.04)",
                      }}
                    >
                      {highlight && (
                        <div
                          className="h-1 rounded-t-xl -mt-6 -mx-6 mb-5"
                          style={{ background: gradient }}
                        />
                      )}
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} size={15} aria-hidden="true" className="fill-warning text-warning" />
                        ))}
                      </div>
                      <p
                        className="text-sm leading-relaxed mb-6 flex-1"
                        style={{ color: colors.body }}
                      >
                        “{t.quote}”
                      </p>
                      <div
                        className="flex items-center gap-3 pt-4 border-t"
                        style={{ borderColor: colors.border }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: gradient }}
                        >
                          <UserRound size={24} aria-hidden="true" className="text-nm-teal" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm" style={{ color: colors.navy }}>
                            {t.name}
                          </div>
                          <div className="text-xs" style={{ color: colors.muted }}>
                            {t.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                type="button"
                aria-label="Previous testimonials"
                onClick={() => go(-1)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{
                  border: `1.5px solid ${colors.border}`,
                  color: colors.navy,
                  backgroundColor: colors.card,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.teal;
                  e.currentTarget.style.color = colors.teal;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.navy;
                }}
              >
                ←
              </button>

              <div className="flex gap-2">
                {Array.from({ length: pageCount }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to testimonial page ${i + 1}`}
                    onClick={() => setPage(i)}
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: i === current ? "24px" : "8px",
                      background: i === current ? gradient : colors.border,
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                aria-label="Next testimonials"
                onClick={() => go(1)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{
                  border: `1.5px solid ${colors.border}`,
                  color: colors.navy,
                  backgroundColor: colors.card,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.teal;
                  e.currentTarget.style.color = colors.teal;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.navy;
                }}
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section
      className="py-20 px-6 border-t"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div
            className="text-xs font-bold tracking-[0.2em] uppercase mb-2"
            style={{ color: colors.teal }}
          >
            The Process
          </div>
          <h2
            className="font-display text-3xl lg:text-4xl font-bold"
            style={{ color: colors.navy }}
          >
            Your Journey from{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: gradient }}>
              Zero to Hero
            </span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 relative">
          <div
            className="hidden lg:block absolute top-14 left-[calc(16.5%+1rem)] right-[calc(16.5%+1rem)] h-px"
            style={{
              background: `linear-gradient(to right, transparent, ${colors.teal}50, ${colors.blue}50, transparent)`,
            }}
          />
          {processSteps.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center text-center group">
              <div className="relative mb-6">
                <div
                  className="w-28 h-28 rounded-2xl flex items-center justify-center text-5xl transition-all group-hover:-translate-y-1"
                  style={{
                    backgroundColor: colors.card,
                    border: `1px solid ${colors.border}`,
                    boxShadow: "0 4px 20px rgba(13,45,82,0.08)",
                  }}
                >
                  <s.icon size={26} aria-hidden="true" className="text-nm-teal-ink" />
                </div>
                <div
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full text-white text-sm font-black flex items-center justify-center shadow-lg"
                  style={{ background: gradient }}
                >
                  {i + 1}
                </div>
              </div>
              <h3 className="font-display font-bold text-xl mb-3" style={{ color: colors.navy }}>
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: colors.muted }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ courses }: { courses: PublicCourse[] }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="py-20 px-6" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-5xl mx-auto">
        <div
          className="relative rounded-3xl overflow-hidden p-12 lg:p-20 text-center"
          style={{ background: heroGradient }}
        >
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(rgba(0,189,184,1) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-40 rounded-full blur-[80px]"
            style={{ backgroundColor: `${colors.teal}20` }}
          />
          <div className="relative">
            <div
              className="inline-flex items-center gap-2 border rounded-full px-5 py-2 text-sm font-medium mb-8"
              style={{
                backgroundColor: `${colors.teal}20`,
                borderColor: `${colors.teal}40`,
                color: colors.teal,
              }}
            >
              {`${nextIntakeLabel()} batch — limited seats remaining`}
            </div>
            <h2
              className="font-display font-bold mb-4 leading-tight text-white"
              style={{ fontSize: "clamp(2rem,4vw,3.5rem)" }}
            >
              Start Your Tech Career
              <br />
              <span style={{ color: colors.teal }}>Today.</span>
            </h2>
            <p
              className="text-lg mb-10 max-w-md mx-auto leading-relaxed"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Book a free 30-minute counselling session and find the perfect course for your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="font-bold px-12 py-4 rounded-xl text-white active:scale-95"
                style={{ background: gradient, boxShadow: `0 6px 32px ${colors.teal}60` }}
              >
                Book Free Counselling
              </button>
              <Link
                href="/courses"
                className="font-semibold px-12 py-4 rounded-xl transition-all text-center"
                style={{
                  border: "1px solid rgba(255,255,255,0.20)",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                Browse All Courses
              </Link>
            </div>
          </div>
        </div>
      </div>

      <EnrollModal isOpen={modalOpen} onClose={() => setModalOpen(false)} courses={courses} />
    </section>
  );
}


/**
 * Next intake label, derived from today rather than hardcoded.
 *
 * The hero badge read "New Batches Starting August 2025" for roughly a year.
 * Deriving it means it can never go stale again: before the 20th we advertise
 * this month, after it the next one.
 */
function nextIntakeLabel() {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + (now.getDate() >= 20 ? 1 : 0), 1);
  return target.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default function HomePage({ courses }: { courses: PublicCourse[] }) {
  return (
    <>
      <Hero courses={courses} />
      <ToolsMarquee />
      <PopularCourses courses={courses} />
      <StatsStrip />
      <Testimonials />
      <Process />
      <FinalCta courses={courses} />
    </>
  );
}
