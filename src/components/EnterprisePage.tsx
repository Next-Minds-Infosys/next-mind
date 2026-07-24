"use client";

import { useState } from "react";
import { colors, gradient, heroGradient } from "@/lib/theme";

const offerings = [
  {
    icon: "🏢",
    title: "Custom Corporate Training",
    desc: "Tailored programs designed around your team's skill gaps, tech stack, and business goals.",
  },
  {
    icon: "📊",
    title: "Team Upskilling Programs",
    desc: "Structured cohort-based training for 5–500 employees. Flexible scheduling around your workday.",
  },
  {
    icon: "🎓",
    title: "Internship & Hiring Pipeline",
    desc: "First access to our quarterly job-ready graduates — vetted, practical, and culture-fit screened.",
  },
  {
    icon: "🔒",
    title: "Cyber Security Workshops",
    desc: "1-day to 2-week intensive workshops: red team, blue team, OWASP, secure coding, compliance.",
  },
  {
    icon: "📡",
    title: "Live Online Cohorts",
    desc: "Your team learns together in fully live instructor-led sessions — no recorded filler.",
  },
  {
    icon: "📜",
    title: "Co-Branded Certification",
    desc: "Issue co-branded certificates recognized by Nepal's IT industry. Boost retention and employer brand.",
  },
];

const tracks = [
  {
    title: "AI & Generative AI",
    icon: "🤖",
    topics: [
      "AI Fundamentals & Prompt Engineering",
      "Building AI-Powered Workflows",
      "Policy, Governance & Compliance",
      "ChatGPT & Copilot for Business",
    ],
  },
  {
    title: "Cyber Security",
    icon: "🔒",
    topics: [
      "Secure Coding Practices",
      "OWASP Top 10 for Teams",
      "Incident Response Training",
      "Security Awareness for All Staff",
    ],
  },
  {
    title: "Digital Marketing",
    icon: "📈",
    topics: [
      "Performance Marketing & Ads",
      "SEO & Content Strategy",
      "Analytics & Data-Driven Decisions",
      "Social Media for Brands",
    ],
  },
  {
    title: "Software Engineering",
    icon: "⚡",
    topics: [
      "DevOps & CI/CD Pipelines",
      "Full Stack Fundamentals",
      "Code Quality & Testing",
      "Cloud Architecture (AWS/Azure)",
    ],
  },
  {
    title: "Data Analytics",
    icon: "📊",
    topics: [
      "Excel & Power BI Mastery",
      "Business Intelligence Basics",
      "SQL for Non-Developers",
      "Dashboard Design for Management",
    ],
  },
  {
    title: "Business & Leadership",
    icon: "💼",
    topics: [
      "Product Management Essentials",
      "Tech Project Management",
      "Communication for Tech Teams",
      "Agile & Scrum for Organizations",
    ],
  },
];

const audiences = [
  {
    type: "🏦 Banks & Fintech",
    desc: "Security awareness, digital banking tools, and compliance training for banking staff.",
  },
  {
    type: "💻 Tech Companies",
    desc: "Advanced engineering, DevOps, and AI training for developer teams at growth-stage startups.",
  },
  {
    type: "🏫 Colleges & Universities",
    desc: "Bridge academic learning to industry readiness through customized workshop programs.",
  },
  {
    type: "🏛️ Government Agencies",
    desc: "Digital transformation training, AI governance, and cybersecurity for public institutions.",
  },
];

const process = [
  {
    step: "01",
    title: "Needs Audit",
    desc: "We assess your team's current skill levels, tools, workflows, and learning objectives.",
  },
  {
    step: "02",
    title: "Custom Curriculum",
    desc: "Our trainers design a role-specific, industry-aligned curriculum tailored to your goals.",
  },
  {
    step: "03",
    title: "Hands-On Delivery",
    desc: "Live training delivered by certified industry professionals — on-site, online, or hybrid.",
  },
  {
    step: "04",
    title: "Impact Measurement",
    desc: "Post-training assessments, certificates, and ROI reporting for your L&D team.",
  },
];

const heroStats = [
  { n: "30+", l: "Corporate Clients", c: colors.teal },
  { n: "500+", l: "Employees Trained", c: colors.blue },
  { n: "95%", l: "Client Retention", c: colors.green },
  { n: "4.8★", l: "Employer Rating", c: "#f4a44a" },
];

const impactStats = [
  {
    num: "70%",
    label: "of Nepali enterprises report a measurable digital skills gap",
    color: colors.teal,
  },
  {
    num: "2–3×",
    label: "faster execution reported after structured digital skills training",
    color: colors.blue,
  },
  {
    num: "60%",
    label: "productivity improvement linked to targeted workforce development",
    color: colors.green,
  },
];

const faqs = [
  {
    q: "How do you customize training for our team?",
    a: "We start with a skills-gap assessment — either a survey or a live session with your team leads. From there, our trainers design a curriculum around your specific tools, goals, and level.",
  },
  {
    q: "What is the minimum group size for corporate training?",
    a: "We work with groups as small as 5 and as large as 500+. Pricing and format adapt based on group size.",
  },
  {
    q: "Can training be delivered at our office?",
    a: "Yes — we offer on-site delivery anywhere in Kathmandu and Lalitpur. For nationwide teams, we do live online sessions with the same quality of instruction.",
  },
  {
    q: "How long does a typical corporate program last?",
    a: "Programs range from 1-day workshops to 3-month upskilling cohorts. Most corporate clients run 4–8 week programs.",
  },
  {
    q: "Do you provide certificates for corporate learners?",
    a: "Yes — participants receive Next Minds completion certificates. For enterprise clients, we also offer co-branded certificates.",
  },
];

const formFields = [
  { label: "Company Name", type: "text", ph: "Your Company Name" },
  { label: "Contact Person", type: "text", ph: "Full Name" },
  { label: "Business Email", type: "email", ph: "work@company.com" },
  { label: "Phone Number", type: "tel", ph: "+977-98XXXXXXXX" },
  { label: "Number of Employees", type: "number", ph: "e.g. 25" },
];

export default function EnterprisePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  const darkFocus = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = colors.teal;
  };
  const darkBlur = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
  };
  const darkInputStyle = {
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1.5px solid rgba(255,255,255,0.15)",
    color: "#fff",
  };

  return (
    <div className="pt-16 min-h-screen" style={{ backgroundColor: colors.bg }}>
      <section
        className="py-20 px-6 relative overflow-hidden"
        style={{ background: heroGradient }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(rgba(0,189,184,1) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute top-0 right-0 w-[600px] h-[400px] rounded-full blur-[130px]"
          style={{ backgroundColor: `${colors.teal}12` }}
        />
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6"
                style={{
                  backgroundColor: `${colors.teal}20`,
                  borderColor: `${colors.teal}40`,
                  color: colors.teal,
                }}
              >
                Enterprise Solutions
              </div>
              <h1
                className="font-display font-bold text-white mb-5 leading-tight"
                style={{ fontSize: "clamp(2.2rem,4vw,3.5rem)" }}
              >
                Nepal&apos;s Trusted
                <br />
                <span style={{ color: colors.teal }}>Corporate IT Training</span>
                <br />
                Partner
              </h1>
              <p
                className="text-lg mb-8 max-w-md leading-relaxed"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                We partner with companies, banks, colleges, and government
                agencies to deliver custom IT training that drives measurable
                business outcomes.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#contact-enterprise"
                  className="font-bold px-8 py-4 rounded-xl text-white"
                  style={{ background: gradient, boxShadow: `0 6px 24px ${colors.teal}50` }}
                >
                  Request a Training Plan
                </a>
                <a
                  href="#offerings"
                  className="font-semibold px-8 py-4 rounded-xl transition-all"
                  style={{
                    border: `1px solid ${colors.border}`,
                    color: colors.body,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.teal;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.color = colors.body;
                  }}
                >
                  View Offerings
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {heroStats.map((s) => (
                <div
                  key={s.l}
                  className="rounded-2xl p-6 text-center"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <div className="font-display text-4xl font-bold mb-1" style={{ color: s.c }}>
                    {s.n}
                  </div>
                  <div className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-14 px-6 border-b"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {impactStats.map((s) => (
            <div
              key={s.label}
              className="flex items-start gap-4 p-5 rounded-2xl"
              style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
            >
              <div
                className="font-display text-4xl font-bold flex-shrink-0"
                style={{ color: s.color }}
              >
                {s.num}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: colors.body }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="offerings" className="py-20 px-6" style={{ backgroundColor: colors.bg }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div
              className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: colors.teal }}
            >
              What We Offer
            </div>
            <h2 className="font-display text-4xl font-bold" style={{ color: colors.navy }}>
              Upskill Your Team.
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: gradient }}
              >
                Outpace the Market.
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offerings.map((o) => (
              <div
                key={o.title}
                className="rounded-2xl p-6 transition-all hover:-translate-y-1"
                style={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  boxShadow: "0 2px 12px rgba(13,45,82,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${colors.teal}45`;
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(13,45,82,0.10)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(13,45,82,0.05)";
                }}
              >
                <div className="text-3xl mb-4">{o.icon}</div>
                <h3
                  className="font-display font-semibold text-lg mb-2"
                  style={{ color: colors.navy }}
                >
                  {o.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>
                  {o.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6" style={{ backgroundColor: colors.surface }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div
              className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: colors.blue }}
            >
              Training Tracks
            </div>
            <h2 className="font-display text-4xl font-bold" style={{ color: colors.navy }}>
              Curated for{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: gradient }}
              >
                Your Industry
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tracks.map((t) => (
              <div
                key={t.title}
                className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                style={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  boxShadow: "0 2px 8px rgba(13,45,82,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${colors.teal}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: colors.light }}
                  >
                    {t.icon}
                  </div>
                  <h3 className="font-display font-semibold" style={{ color: colors.navy }}>
                    {t.title}
                  </h3>
                </div>
                <div className="space-y-2">
                  {t.topics.map((topic) => (
                    <div
                      key={topic}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: colors.body }}
                    >
                      <span style={{ color: colors.teal }}>→</span>
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
              Who We Serve
            </div>
            <h2 className="font-display text-4xl font-bold" style={{ color: colors.navy }}>
              Built for Every Organization
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {audiences.map((a) => (
              <div
                key={a.type}
                className="rounded-2xl p-6 text-center transition-all hover:-translate-y-1"
                style={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  boxShadow: "0 2px 8px rgba(13,45,82,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${colors.teal}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <div className="text-2xl mb-3">{a.type.split(" ")[0]}</div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: colors.navy }}>
                  {a.type.split(" ").slice(1).join(" ")}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: colors.muted }}>
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6" style={{ backgroundColor: colors.surface }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div
              className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: colors.teal }}
            >
              Our Process
            </div>
            <h2 className="font-display text-4xl font-bold" style={{ color: colors.navy }}>
              How It{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: gradient }}
              >
                Works
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div
              className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px"
              style={{
                background: `linear-gradient(to right, transparent, ${colors.teal}40, ${colors.blue}40, transparent)`,
              }}
            />
            {process.map((p, i) => (
              <div key={p.step} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center font-display font-black text-3xl relative z-10 transition-transform hover:scale-105"
                    style={{
                      background: i % 2 === 0 ? `${colors.teal}15` : `${colors.blue}15`,
                      color: i % 2 === 0 ? colors.teal : colors.blue,
                      border: `2px solid ${i % 2 === 0 ? colors.teal : colors.blue}25`,
                    }}
                  >
                    {p.step}
                  </div>
                </div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: colors.navy }}>
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6" style={{ backgroundColor: colors.bg }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div
              className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: colors.blue }}
            >
              FAQ
            </div>
            <h2 className="font-display text-4xl font-bold" style={{ color: colors.navy }}>
              Enterprise Questions
            </h2>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={faq.q}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  border: `1px solid ${openFaq === i ? `${colors.teal}50` : colors.border}`,
                  backgroundColor: openFaq === i ? `${colors.teal}05` : colors.card,
                }}
              >
                <button
                  type="button"
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-sm" style={{ color: colors.navy }}>
                    {faq.q}
                  </span>
                  <span
                    className="text-2xl leading-none flex-shrink-0 transition-transform duration-200"
                    style={{
                      color: colors.teal,
                      transform: openFaq === i ? "rotate(45deg)" : "none",
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: openFaq === i ? "12rem" : "0" }}
                >
                  <p
                    className="px-6 pb-5 pt-1 text-sm leading-relaxed border-t"
                    style={{ color: colors.body, borderColor: colors.border }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact-enterprise"
        className="py-20 px-6"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-3xl p-8 lg:p-12"
            style={{ background: heroGradient }}
          >
            <div className="text-center mb-8">
              <h2 className="font-display font-bold text-white text-3xl mb-3">
                Request a Training Plan
              </h2>
              <p style={{ color: "rgba(255,255,255,0.65)" }}>
                Tell us about your team. We&apos;ll get back within 24 hours with
                a custom proposal.
              </p>
            </div>

            {sent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-bold text-white text-xl mb-2">Request Received!</h3>
                <p style={{ color: "rgba(255,255,255,0.65)" }}>
                  Our enterprise team will reach out within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="space-y-4"
              >
                {formFields.map((f) => (
                  <div key={f.label}>
                    <label
                      className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      placeholder={f.ph}
                      required
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      style={darkInputStyle}
                      onFocus={darkFocus}
                      onBlur={darkBlur}
                    />
                  </div>
                ))}
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    Training Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your team's skills gaps and training goals…"
                    required
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
                    style={darkInputStyle}
                    onFocus={darkFocus}
                    onBlur={darkBlur}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full font-bold py-4 rounded-xl text-white transition-all active:scale-[0.98]"
                  style={{ background: gradient, boxShadow: `0 4px 20px ${colors.teal}50` }}
                >
                  Submit Request
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
