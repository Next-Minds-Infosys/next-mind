"use client";

import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import { successStories } from "@/data/courses";
import { colors, gradient, heroGradient } from "@/lib/theme";

const stats = [
  { n: "3,000+", l: "Total Graduates", c: colors.teal },
  { n: "82%", l: "Placement Rate", c: colors.blue },
  { n: "NPR 60K+", l: "Avg Starting Salary", c: colors.green },
  { n: "200+", l: "Hiring Partners", c: "#f4a44a" },
];

export default function SuccessStoriesPage() {
  return (
    <SiteLayout>
      <div className="pt-16 min-h-screen" style={{ backgroundColor: colors.bg }}>
        <section
          className="py-20 px-6"
          style={{ background: heroGradient }}
        >
          <div className="max-w-7xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6"
              style={{
                backgroundColor: `${colors.green}20`,
                borderColor: `${colors.green}40`,
                color: colors.green,
              }}
            >
              Success Stories
            </div>
            <h1
              className="font-display font-bold text-white mb-4"
              style={{ fontSize: "clamp(2rem,4vw,3.5rem)" }}
            >
              Real People.
              <br />
              <span style={{ color: colors.teal }}>Real Careers.</span>
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
              From beginners to employed IT professionals — meet the graduates
              who changed their lives through Next Minds.
            </p>
          </div>
        </section>

        <section
          className="py-10 px-6 border-b"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div
                key={s.l}
                className="rounded-2xl p-5 text-center"
                style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
              >
                <div className="font-display text-3xl font-bold mb-1" style={{ color: s.c }}>
                  {s.n}
                </div>
                <div className="text-xs" style={{ color: colors.muted }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {successStories.map((s) => (
                <div
                  key={s.id}
                  className="rounded-3xl overflow-hidden transition-all hover:-translate-y-1.5"
                  style={{
                    backgroundColor: colors.card,
                    border: `1px solid ${colors.border}`,
                    boxShadow: "0 2px 12px rgba(13,45,82,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${colors.teal}40`;
                    e.currentTarget.style.boxShadow = "0 16px 50px rgba(13,45,82,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(13,45,82,0.06)";
                  }}
                >
                  <div className="p-6 pb-0">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-14 h-14 rounded-2xl text-3xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${colors.teal}20, ${colors.blue}20)`,
                        }}
                      >
                        {s.emoji}
                      </div>
                      <div>
                        <h3 className="font-display font-bold" style={{ color: colors.navy }}>
                          {s.name}
                        </h3>
                        <p className="text-xs" style={{ color: colors.teal }}>
                          {s.role}
                        </p>
                        <p className="text-xs" style={{ color: colors.muted }}>
                          {s.company}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <div
                      className="flex items-center gap-2 mb-4 p-3 rounded-xl"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <div className="text-center flex-1">
                        <div
                          className="text-xs mb-0.5 uppercase font-bold tracking-wide"
                          style={{ color: colors.muted }}
                        >
                          Before
                        </div>
                        <div className="text-xs font-semibold" style={{ color: colors.body }}>
                          {s.before}
                        </div>
                      </div>
                      <div className="text-xl flex-shrink-0" style={{ color: colors.teal }}>
                        →
                      </div>
                      <div className="text-center flex-1">
                        <div
                          className="text-xs mb-0.5 uppercase font-bold tracking-wide"
                          style={{ color: colors.muted }}
                        >
                          After
                        </div>
                        <div className="text-xs font-semibold" style={{ color: colors.navy }}>
                          {s.after}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className="text-xs font-bold px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: `${colors.green}15`, color: colors.green }}
                      >
                        💰 {s.salary}
                      </span>
                      <span
                        className="text-xs font-semibold px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: `${colors.teal}10`, color: colors.teal }}
                      >
                        📚 {s.course}
                      </span>
                    </div>

                    <blockquote
                      className="text-sm leading-relaxed italic"
                      style={{ color: colors.body }}
                    >
                      &quot;{s.quote}&quot;
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6" style={{ backgroundColor: colors.surface }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-4xl font-bold mb-4" style={{ color: colors.navy }}>
              Your story starts here.
            </h2>
            <p className="text-lg mb-8" style={{ color: colors.muted }}>
              Join 3,000+ graduates who turned their learning into a career.
            </p>
            <Link
              href="/courses"
              className="font-bold px-8 py-4 rounded-xl text-white inline-block"
              style={{ background: gradient }}
            >
              Browse Courses →
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
