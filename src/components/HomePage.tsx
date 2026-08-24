"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { testimonials } from "@/data/courses";
import type { CourseCard } from "@/db/queries";
import { stats } from "@/lib/stats";
import { borderSoft, colors, ctaBody, ctaEyebrow, ctaGradient, gradient, heroWash, statGradient } from "@/lib/theme";
import { CourseCardTile } from "./CourseCardTile";
import EnrollModal from "./EnrollModal";
import { Briefcase, GraduationCap, Handshake, Rocket, Star, Target, UserCog, Zap } from "lucide-react";

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

/** Decorative stand-ins for student faces beside the rating. */
const avatarTints = ["#00c29a", "#0095de", "#6dd3c0", "#ee9748"];

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

function Hero({ courses }: { courses: CourseCard[] }) {
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
    <section
      className="relative overflow-hidden pt-16"
      /* A wash that has faded to white by 65% down, so the hero lifts off the
         page without a hard seam where it meets the stat band below. */
      style={{ background: heroWash }}
    >
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

      <div className="relative max-w-[1240px] mx-auto px-6 py-16 lg:py-24">
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
              className="font-display mb-6 font-extrabold leading-[1.05] tracking-[-1.2px]"
              style={{ fontSize: "clamp(34px,5.2vw,58px)", color: colors.navy }}
            >
              Learn{" "}
              <span
                className="inline-block transition-all duration-300"
                style={{
                  // NOT colors.teal - the fill teal is 2.29:1 on white and fails AA even
                  // at this size; large text still needs 3:1. tealInk is 5.29:1.
                  color: colors.tealInk,
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(8px)",
                }}
              >
                {rotatingWords[index]}
              </span>
              <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: statGradient }}>
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

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex">
                {avatarTints.map((c, i) => (
                  <div
                    key={c}
                    aria-hidden="true"
                    className="h-[30px] w-[30px] rounded-full border-2 border-white"
                    style={{ background: c, marginLeft: i === 0 ? 0 : -8 }}
                  />
                ))}
              </div>
              <div className="text-[13.5px] font-bold" style={{ color: colors.body }}>
                4.9{" "}
                <span className="font-semibold" style={{ color: colors.muted }}>
                  from 200+ reviews
                </span>
              </div>
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


function PopularCourses({ courses }: { courses: CourseCard[] }) {
  const [active, setActive] = useState("All");

  // Derived from the data rather than hard-coded, so a new category added in the
  // admin dashboard shows up here without a code change.
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(courses.map((c) => c.category)))],
    [courses],
  );
  const visible = active === "All" ? courses : courses.filter((c) => c.category === active);

  return (
    <section className="px-6 py-[70px]">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-3.5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div
              className="mb-2 text-[13px] font-bold uppercase tracking-[0.06em]"
              style={{ color: colors.tealInk }}
            >
              Our Courses
            </div>
            <h2
              className="font-display font-extrabold tracking-[-0.6px]"
              style={{ fontSize: "clamp(24px,3.4vw,34px)", color: colors.navy }}
            >
              Find your path to a
              <br />
              future-proof career
            </h2>
          </div>
          <Link
            href="/courses"
            className="flex-shrink-0 text-[14.5px] font-bold transition-colors"
            style={{ color: colors.tealInk }}
          >
            View all courses →
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto py-5 pb-[26px]">
          {categories.map((cat) => {
            const on = cat === active;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                aria-pressed={on}
                className="flex-shrink-0 whitespace-nowrap rounded-full px-[18px] py-2.5 text-[13.5px] font-bold transition-colors"
                style={
                  on
                    ? { background: colors.teal, color: "#fff", border: `1px solid ${colors.teal}` }
                    : { background: "#fff", color: colors.navy, border: `1px solid ${colors.border}` }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {visible.map((course) => (
            <CourseCardTile key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    // A hairline band, not a panel: the design separates it from the hero with
    // rules top and bottom rather than a fill, so the eye reads it as a caption
    // to the hero rather than as its own section.
    <section
      className="border-y px-6 py-7"
      style={{ borderColor: borderSoft }}
    >
      <div className="mx-auto grid max-w-[1240px] gap-6 text-center [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        {stripStats.map((s) => (
          <div key={s.l}>
            <div
              className="bg-clip-text font-extrabold tracking-[-0.5px] text-transparent"
              style={{ fontSize: "clamp(24px,3vw,32px)", backgroundImage: statGradient }}
            >
              {s.n}
            </div>
            <div className="mt-1 text-[13px] font-semibold" style={{ color: colors.muted }}>
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** "Roshan Maharjan" -> "RM". Falls back to one letter for single-word names. */
function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
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
    <section className="px-6 py-[70px]" style={{ backgroundColor: "#f9fafb" }}>
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div
              className="mb-2 text-[13px] font-bold uppercase tracking-[0.06em]"
              style={{ color: colors.tealInk }}
            >
              Student Stories
            </div>
            <h2
              className="font-display font-extrabold tracking-[-0.6px]"
              style={{ fontSize: "clamp(24px,3.4vw,34px)", color: colors.navy }}
            >
              What our students say
            </h2>
          </div>
          <Link
            href="/testimonials"
            className="hidden text-[14.5px] font-bold sm:block"
            style={{ color: colors.tealInk }}
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
                      className="flex h-full flex-col rounded-[20px] p-7"
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
                            aria-hidden="true"
                            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                            style={{ background: gradient }}
                          >
                            {initialsOf(t.name)}
                          </div>
                        <div>
                          <div className="text-[14.5px] font-extrabold" style={{ color: colors.navy }}>
                            {t.name}
                          </div>
                          <div className="text-[13px]" style={{ color: colors.mutedSoft }}>
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
    <section className="px-6 py-[70px]">
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-11 text-center">
          <div
            className="mb-2 text-[13px] font-bold uppercase tracking-[0.06em]"
            style={{ color: colors.tealInk }}
          >
            The Process
          </div>
          <h2
            className="font-display font-extrabold tracking-[-0.6px]"
            style={{ fontSize: "clamp(24px,3.4vw,34px)", color: colors.navy }}
          >
            Your journey from zero to hero
          </h2>
        </div>

        <div className="grid gap-7 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {processSteps.map((s, i) => (
            <div key={s.title} className="text-center">
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] text-lg font-extrabold text-white"
                style={{ background: gradient }}
              >
                {i + 1}
              </div>
              <h3 className="mb-2 text-[17px] font-extrabold" style={{ color: colors.navy }}>
                {s.title}
              </h3>
              <p className="text-[13.5px] leading-[1.55]" style={{ color: colors.muted }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ courses }: { courses: CourseCard[] }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    // Full-bleed in the design rather than an inset rounded card: the band runs
    // edge to edge so the page ends on a hard colour change into the footer.
    <section className="px-6 py-[70px] text-white" style={{ background: ctaGradient }}>
      <div className="mx-auto max-w-[760px] text-center">
        <div
          className="mb-4 text-[12.5px] font-bold uppercase tracking-[0.05em]"
          style={{ color: ctaEyebrow }}
        >
          {`${nextIntakeLabel()} batch — limited seats remaining`}
        </div>
        <h2
          className="font-display mb-3.5 font-extrabold tracking-[-0.8px]"
          style={{ fontSize: "clamp(26px,4vw,38px)" }}
        >
          Start your tech career today.
        </h2>
        <p className="mx-auto mb-[30px] text-[15.5px]" style={{ color: ctaBody }}>
          Book a free 30-minute counselling session and find the perfect course for your goals.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-xl bg-white px-7 py-3.5 text-[15px] font-bold transition-transform active:scale-95"
            style={{ color: colors.navyDeep }}
          >
            Book Free Counselling
          </button>
          <Link
            href="/courses"
            className="rounded-xl px-7 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.3)" }}
          >
            Browse All Courses
          </Link>
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

export default function HomePage({ courses }: { courses: CourseCard[] }) {
  return (
    <>
      
        <Hero courses={courses} />
        {/* The design places the stat band immediately under the hero, where it
            reads as a caption to it, and the tools marquee after. */}
        <StatsStrip />
        <ToolsMarquee />
        <PopularCourses courses={courses} />
        <Testimonials />
        <Process />
        <FinalCta courses={courses} />
    </>
  );
}
