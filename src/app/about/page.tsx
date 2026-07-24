"use client";

import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import { colors, gradient, heroGradient } from "@/lib/theme";

const team = [
  {
    name: "Rajesh Shrestha",
    role: "Founder & CEO",
    emoji: "👨‍💼",
    bio: "10+ years building Nepal's tech talent ecosystem. Ex-software engineer turned educator.",
  },
  {
    name: "Priya Tamang",
    role: "Head of Curriculum",
    emoji: "👩‍🏫",
    bio: "Curriculum designer with a background in instructional design and 8 years in ed-tech.",
  },
  {
    name: "Suman Adhikari",
    role: "Lead Instructor — Cyber Security",
    emoji: "👨‍💻",
    bio: "Certified ethical hacker (CEH). Previously worked in enterprise security for Nepal Telecom.",
  },
  {
    name: "Anita Maharjan",
    role: "Lead Instructor — Data Science",
    emoji: "👩‍🔬",
    bio: "Data scientist with 6 years at Leapfrog Technology. MSc in Data Analytics, NTU Singapore.",
  },
  {
    name: "Bikash Poudel",
    role: "Head of Career Services",
    emoji: "🤝",
    bio: "Placement specialist with a network of 200+ hiring partners across Nepal's IT sector.",
  },
  {
    name: "Samrita KC",
    role: "Lead Instructor — Full Stack",
    emoji: "👩‍💻",
    bio: "Full-stack developer and open-source contributor. MERN & Django specialist.",
  },
];

const values = [
  {
    icon: "🎯",
    title: "Outcome-Focused",
    desc: "We measure success by your job placement and salary growth — not just course completions.",
  },
  {
    icon: "🏗️",
    title: "Hands-On First",
    desc: "Every concept is followed by a project. You leave with a portfolio, not just a certificate.",
  },
  {
    icon: "🌍",
    title: "Nepal-Centered",
    desc: "Our curriculum is built for Nepal's tech market — teaching tools, frameworks, and companies that are hiring here.",
  },
  {
    icon: "🤝",
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
    desc: "Expanded to 4 full-time classrooms. 3,000+ total graduates across all programs.",
  },
];

const stats = [
  { n: "3,000+", l: "Graduates", c: colors.teal },
  { n: "8+", l: "IT Courses", c: colors.blue },
  { n: "82%", l: "Placement Rate", c: colors.green },
  { n: "200+", l: "Hiring Partners", c: "#f4a44a" },
];

export default function AboutPage() {
  return (
    <SiteLayout>
      <div className="pt-16 min-h-screen" style={{ backgroundColor: colors.bg }}>
        <section
          className="py-20 px-6"
          style={{ background: heroGradient }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl">
              <div
                className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6"
                style={{
                  backgroundColor: `${colors.teal}20`,
                  borderColor: `${colors.teal}40`,
                  color: colors.teal,
                }}
              >
                Our Story
              </div>
              <h1
                className="font-display font-bold text-white mb-6 leading-tight"
                style={{ fontSize: "clamp(2rem,4vw,3.5rem)" }}
              >
                We&apos;re Building Nepal&apos;s
                <br />
                <span style={{ color: colors.teal }}>Next Generation</span> of IT Talent
              </h1>
              <p className="text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                Since 2018, Next Minds Infosys has been on a single mission: make
                world-class IT education accessible to every ambitious Nepali —
                regardless of background, location, or prior experience.
              </p>
            </div>
          </div>
        </section>

        <section
          className="py-14 px-6 border-b"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div
                  key={s.l}
                  className="rounded-2xl p-6 text-center"
                  style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
                >
                  <div className="font-display text-4xl font-bold mb-1" style={{ color: s.c }}>
                    {s.n}
                  </div>
                  <div className="text-sm" style={{ color: colors.muted }}>
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6" style={{ backgroundColor: colors.bg }}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div
                className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
                style={{ color: colors.teal }}
              >
                Our Mission
              </div>
              <h2
                className="font-display text-4xl font-bold mb-5 leading-tight"
                style={{ color: colors.navy }}
              >
                Practical Skills.
                <br />
                Real Jobs.
                <br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: gradient }}
                >
                  Measurable Impact.
                </span>
              </h2>
              <p className="text-base leading-relaxed mb-5" style={{ color: colors.body }}>
                Nepal has no shortage of bright minds — it has a shortage of
                practical IT education that connects theory to real industry
                work. We built Next Minds to close that gap.
              </p>
              <p className="text-base leading-relaxed" style={{ color: colors.body }}>
                Every course is taught by working professionals, grounded in real
                projects, and backed by our placement team — because a
                certificate without a career path is just paper.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
                >
                  <div className="text-2xl mb-3">{v.icon}</div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: colors.navy }}>
                    {v.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: colors.muted }}>
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6" style={{ backgroundColor: colors.surface }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div
                className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
                style={{ color: colors.blue }}
              >
                Timeline
              </div>
              <h2 className="font-display text-4xl font-bold" style={{ color: colors.navy }}>
                How We Got Here
              </h2>
            </div>
            <div className="relative">
              <div
                className="absolute left-[72px] top-0 bottom-0 w-px"
                style={{ backgroundColor: colors.border }}
              />
              <div className="space-y-6">
                {timeline.map((t, i) => (
                  <div key={t.year} className="flex gap-6 items-start">
                    <div className="w-[72px] flex-shrink-0 text-right">
                      <span
                        className="font-display font-bold text-sm"
                        style={{ color: i % 2 === 0 ? colors.teal : colors.blue }}
                      >
                        {t.year}
                      </span>
                    </div>
                    <div className="relative">
                      <div
                        className="w-3 h-3 rounded-full absolute -left-[26.5px] top-1.5 border-2 border-white"
                        style={{ backgroundColor: i % 2 === 0 ? colors.teal : colors.blue }}
                      />
                      <div
                        className="ml-4 rounded-2xl p-4"
                        style={{
                          backgroundColor: colors.card,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        <div
                          className="font-semibold mb-1 text-sm"
                          style={{ color: colors.navy }}
                        >
                          {t.title}
                        </div>
                        <div className="text-xs leading-relaxed" style={{ color: colors.muted }}>
                          {t.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6" style={{ backgroundColor: colors.bg }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div
                className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
                style={{ color: colors.green }}
              >
                The Team
              </div>
              <h2 className="font-display text-4xl font-bold" style={{ color: colors.navy }}>
                People Behind Next Minds
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {team.map((m) => (
                <div
                  key={m.name}
                  className="rounded-2xl p-6 transition-all hover:-translate-y-1"
                  style={{
                    backgroundColor: colors.card,
                    border: `1px solid ${colors.border}`,
                    boxShadow: "0 2px 8px rgba(13,45,82,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${colors.teal}40`;
                    e.currentTarget.style.boxShadow = "0 12px 40px rgba(13,45,82,0.10)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(13,45,82,0.05)";
                  }}
                >
                  <div className="text-4xl mb-4">{m.emoji}</div>
                  <h3 className="font-display font-bold mb-0.5" style={{ color: colors.navy }}>
                    {m.name}
                  </h3>
                  <div
                    className="text-xs font-semibold mb-3 uppercase tracking-wide"
                    style={{ color: colors.teal }}
                  >
                    {m.role}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>
                    {m.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6" style={{ backgroundColor: colors.surface }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-4xl font-bold mb-4" style={{ color: colors.navy }}>
              Ready to start your journey?
            </h2>
            <p className="text-lg mb-8" style={{ color: colors.muted }}>
              Explore our courses or reach out — we&apos;re happy to help you
              find the right path.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/courses"
                className="font-bold px-8 py-4 rounded-xl text-white"
                style={{ background: gradient }}
              >
                Browse Courses
              </Link>
              <Link
                href="/contact"
                className="font-semibold px-8 py-4 rounded-xl transition-all"
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
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
