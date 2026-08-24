"use client";

import Link from "next/link";
import { testimonials } from "@/data/courses";
import { colors, gradient, heroGradient } from "@/lib/theme";
import { Star, Target, UserRound } from "lucide-react";

const headStats = [
  { n: "4.9/5", l: "Average Rating" },
  { n: "3,000+", l: "Reviews" },
  { n: "98%", l: "Would Recommend" },
];

export default function TestimonialsPage() {
  const cards = [...testimonials, ...testimonials];

  return (
    <>
      <div className="pt-16 min-h-screen" style={{ backgroundColor: colors.bg }}>
        <section className="py-20 px-6" style={{ background: heroGradient }}>
          <div className="max-w-[1240px] mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6"
              style={{
                backgroundColor: `${colors.teal}20`,
                borderColor: `${colors.teal}40`,
                color: colors.teal,
              }}
            >
              Testimonials
            </div>
            <h1
              className="font-display font-bold text-white mb-4"
              style={{ fontSize: "clamp(2rem,4vw,3.5rem)" }}
            >
              What Our <span style={{ color: colors.teal }}>Students Say</span>
            </h1>
            <p className="text-lg max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
              Over 3,000 students have passed through our doors. Here&apos;s what a few of them have
              to say.
            </p>
            <div className="flex justify-center gap-8 mt-10">
              {headStats.map((s) => (
                <div key={s.l}>
                  <div className="font-display font-bold text-2xl text-white">{s.n}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-[1240px] mx-auto columns-1 sm:columns-2 lg:columns-3 gap-5">
            {cards.map((t, i) => (
              <div
                key={`${t.name}-${i}`}
                className="break-inside-avoid mb-5 rounded-2xl p-5 transition-all hover:-translate-y-0.5 inline-block w-full"
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
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={15} aria-hidden="true" className="fill-warning text-warning" />
                  ))}
                </div>
                <blockquote
                  className="text-sm leading-relaxed mb-4 italic"
                  style={{ color: colors.body }}
                >
                  &quot;{t.quote}&quot;
                </blockquote>
                <div
                  className="flex items-center gap-3 border-t pt-3"
                  style={{ borderColor: colors.border }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${colors.teal}20, ${colors.blue}20)`,
                    }}
                  >
                    <UserRound size={24} aria-hidden="true" className="text-nm-teal" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: colors.navy }}>
                      {t.name}
                    </div>
                    <div className="text-xs" style={{ color: colors.muted }}>
                      {t.role} · {t.course}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 px-6" style={{ backgroundColor: colors.surface }}>
          <div className="max-w-2xl mx-auto text-center">
            <Target size={44} aria-hidden="true" className="mx-auto mb-4 text-nm-teal-ink" />
            <h2 className="font-display text-3xl font-bold mb-4" style={{ color: colors.navy }}>
              Be the next success story.
            </h2>
            <p className="mb-8" style={{ color: colors.muted }}>
              Enroll in a course and start building the skills that get you hired.
            </p>
            <Link
              href="/courses"
              className="font-bold px-8 py-4 rounded-xl text-white inline-block"
              style={{ background: gradient }}
            >
              Explore Courses →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
