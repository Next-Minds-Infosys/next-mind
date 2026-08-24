"use client";

import Link from "next/link";
import { borderSoft, colors, ctaBody, ctaGradient, gradient, heroWash, statGradient } from "@/lib/theme";
import { stats as instituteStats } from "@/lib/stats";
import { Globe, Hammer, Handshake, Target } from "lucide-react";

const team = [
  {
    name: "Rajesh Shrestha",
    role: "Founder & CEO",
        bio: "10+ years building Nepal's tech talent ecosystem. Ex-software engineer turned educator.",
  },
  {
    name: "Priya Tamang",
    role: "Head of Curriculum",
        bio: "Curriculum designer with a background in instructional design and 8 years in ed-tech.",
  },
  {
    name: "Suman Adhikari",
    role: "Lead Instructor — Cyber Security",
        bio: "Certified ethical hacker (CEH). Previously worked in enterprise security for Nepal Telecom.",
  },
  {
    name: "Anita Maharjan",
    role: "Lead Instructor — Data Science",
        bio: "Data scientist with 6 years at Leapfrog Technology. MSc in Data Analytics, NTU Singapore.",
  },
  {
    name: "Bikash Poudel",
    role: "Head of Career Services",
        bio: "Placement specialist, building our hiring-partner network across Nepal's IT sector.",
  },
  {
    name: "Samrita KC",
    role: "Lead Instructor — Full Stack",
        bio: "Full-stack developer and open-source contributor. MERN & Django specialist.",
  },
];

const values = [
  {
    icon: Target,
    title: "Outcome-Focused",
    desc: "We measure success by your job placement and salary growth — not just course completions.",
  },
  {
    icon: Hammer,
    title: "Hands-On First",
    desc: "Every concept is followed by a project. You leave with a portfolio, not just a certificate.",
  },
  {
    icon: Globe,
    title: "Nepal-Centered",
    desc: "Our curriculum is built for Nepal's tech market — teaching tools, frameworks, and companies that are hiring here.",
  },
  {
    icon: Handshake,
    title: "Accessible Education",
    desc: "EMI options, scholarships, and flexible schedules so nothing stops talented people from learning.",
  },
];

const timeline = [
  {
    year: "2018",
    title: "Founded",
    desc: "Next Minds opens in New Baneshwor with 30 students and 2 courses.",
  },
  {
    year: "2020",
    title: "Online Launch",
    desc: "Pivoted to online delivery. 300+ students enrolled during the first virtual batch.",
  },
  {
    year: "2022",
    title: "1,000 Graduates",
    desc: "Reached 1,000 course completions. Placement rate crosses 82%.",
  },
  {
    year: "2023",
    title: "Enterprise Program",
    desc: "Launched corporate training. First 10 B2B clients onboarded within 6 months.",
  },
  {
    year: "2024",
    title: "AI Integration",
    desc: "All programs updated with AI & GenAI modules. AI-augmented teaching tools deployed.",
  },
  {
    year: "2025",
    title: "New Campus Expansion",
    desc: "Expanded to 4 full-time classrooms across all programs.",
  },
];

// Was 3,000+ graduates / 200+ partners here against 1,200+ students / 50+
// partners on the homepage. Same source now, so the pages cannot disagree.
const aboutStats = [
  { n: instituteStats.studentsTrained, l: "Students Trained", c: colors.teal },
  { n: "8+", l: "IT Courses", c: colors.blue },
  { n: instituteStats.placementRate, l: "Placement Rate", c: colors.green },
  { n: instituteStats.hiringPartners, l: "Hiring Partners", c: "#f4a44a" },
];

/** "Rajesh Shrestha" -> "RS". Stands in until real team photos are supplied. */
function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-2 text-[13px] font-bold uppercase tracking-[0.06em]"
      style={{ color: colors.tealInk }}
    >
      {children}
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <div className="min-h-screen pt-16" style={{ backgroundColor: colors.bg }}>
        {/* Hero - the design centres this on a pale wash rather than the dark
            navy panel the page used before. */}
        <section className="px-6 py-16" style={{ background: heroWash }}>
          <div className="mx-auto max-w-[900px] text-center">
            <Eyebrow>Our Story</Eyebrow>
            <h1
              className="font-display mb-4.5 font-extrabold leading-[1.1] tracking-[-0.9px]"
              style={{ fontSize: "clamp(28px,4.6vw,44px)", color: colors.navy }}
            >
              We&apos;re building Nepal&apos;s next generation of IT talent
            </h1>
            <p
              className="mx-auto max-w-[640px] text-base leading-[1.6]"
              style={{ color: colors.body }}
            >
              Since 2018, Next Minds Infosys has been on a single mission: make world-class IT
              education accessible to every ambitious Nepali — regardless of background, location,
              or prior experience.
            </p>
          </div>
        </section>

        <section className="border-y px-6 py-7" style={{ borderColor: borderSoft }}>
          <div className="mx-auto grid max-w-[1000px] gap-6 text-center [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
            {aboutStats.map((s) => (
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

        {/* Mission: copy on the left, the four values as a 2x2 on the right. */}
        <section className="px-6 py-[70px]">
          <div className="mx-auto grid max-w-[1100px] items-start gap-11 lg:grid-cols-[1fr_1fr]">
            <div>
              <Eyebrow>Our Mission</Eyebrow>
              <h2
                className="font-display mb-4.5 font-extrabold leading-[1.15] tracking-[-0.6px]"
                style={{ fontSize: "clamp(24px,3.2vw,32px)", color: colors.navy }}
              >
                Practical skills. Real jobs. Measurable impact.
              </h2>
              <p className="mb-4 text-[15px] leading-[1.65]" style={{ color: colors.body }}>
                Nepal has no shortage of bright minds — it has a shortage of practical IT education
                that connects theory to real industry work. We built Next Minds to close that gap.
              </p>
              <p className="text-[15px] leading-[1.65]" style={{ color: colors.body }}>
                Every course is taught by working professionals, grounded in real projects, and
                backed by our placement team — because a certificate without a career path is just
                paper.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: colors.surface }}
                >
                  <div
                    className="mb-3.5 flex h-[38px] w-[38px] items-center justify-center rounded-[10px]"
                    style={{ background: gradient }}
                  >
                    <v.icon size={19} aria-hidden="true" className="text-white" />
                  </div>
                  <h3 className="mb-1.5 text-[15px] font-extrabold" style={{ color: colors.navy }}>
                    {v.title}
                  </h3>
                  <p className="text-[13px] leading-[1.5]" style={{ color: colors.muted }}>
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline - a plain ruled list in the design, not a rail with dots. */}
        <section className="px-6 py-[70px]" style={{ backgroundColor: colors.surface }}>
          <div className="mx-auto max-w-[1000px]">
            <div className="mb-11 text-center">
              <Eyebrow>Timeline</Eyebrow>
              <h2
                className="font-display font-extrabold tracking-[-0.6px]"
                style={{ fontSize: "clamp(24px,3.4vw,34px)", color: colors.navy }}
              >
                How we got here
              </h2>
            </div>
            <div className="flex flex-col">
              {timeline.map((t) => (
                <div
                  key={t.year}
                  className="grid gap-6 py-5 [grid-template-columns:64px_1fr] sm:[grid-template-columns:80px_1fr]"
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                >
                  <div className="text-xl font-extrabold" style={{ color: colors.tealInk }}>
                    {t.year}
                  </div>
                  <div>
                    <div
                      className="mb-1 text-[15.5px] font-extrabold"
                      style={{ color: colors.navy }}
                    >
                      {t.title}
                    </div>
                    <div className="text-[13.5px] leading-[1.5]" style={{ color: colors.muted }}>
                      {t.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-[70px]">
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-11 text-center">
              <Eyebrow>The Team</Eyebrow>
              <h2
                className="font-display font-extrabold tracking-[-0.6px]"
                style={{ fontSize: "clamp(24px,3.4vw,34px)", color: colors.navy }}
              >
                People behind Next Minds
              </h2>
            </div>
            <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
              {team.map((m) => (
                <div key={m.name} className="text-center">
                  {/* The design puts a photo here. Until real headshots exist,
                      initials on the brand gradient read as deliberate rather
                      than as a broken image. */}
                  <div
                    aria-hidden="true"
                    className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-2xl font-extrabold text-white"
                    style={{ background: gradient }}
                  >
                    {initialsOf(m.name)}
                  </div>
                  <h3 className="mb-1 text-[15.5px] font-extrabold" style={{ color: colors.navy }}>
                    {m.name}
                  </h3>
                  <div
                    className="mb-2 text-[12.5px] font-bold"
                    style={{ color: colors.tealInk }}
                  >
                    {m.role}
                  </div>
                  <p className="text-[13px] leading-[1.5]" style={{ color: colors.muted }}>
                    {m.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-[70px] text-white" style={{ background: ctaGradient }}>
          <div className="mx-auto max-w-[700px] text-center">
            <h2
              className="font-display mb-3 font-extrabold tracking-[-0.6px]"
              style={{ fontSize: "clamp(24px,3.6vw,32px)" }}
            >
              Ready to start your journey?
            </h2>
            <p className="mb-7 text-[15px]" style={{ color: ctaBody }}>
              Explore our courses or reach out — we&apos;re happy to help you find the right path.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/courses"
                className="rounded-xl bg-white px-7 py-3.5 text-[15px] font-bold"
                style={{ color: colors.navyDeep }}
              >
                Browse Courses
              </Link>
              <Link
                href="/contact"
                className="rounded-xl px-7 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.3)" }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
