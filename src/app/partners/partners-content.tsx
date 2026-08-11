"use client";

import Link from "next/link";
import { colors, gradient, heroGradient } from "@/lib/theme";
import partners from "@/data/partners.json";
import { Briefcase, Building2, GraduationCap, Handshake, Zap } from "lucide-react";

const partnerTypes = [
  {
    title: "Hiring Partners",
    icon: Briefcase,
    desc: "Companies that actively hire our graduates.",
  },
  {
    title: "Technology Partners",
    icon: Zap,
    desc: "Tools and platforms we use in our curriculum.",
  },
  {
    title: "Academic Partners",
    icon: GraduationCap,
    desc: "Universities and colleges we collaborate with.",
  },
];

export default function PartnersPage() {
  const grid = [...partners, ...partners.slice(0, 5)];

  return (
    <>
      <div className="pt-16 min-h-screen" style={{ backgroundColor: colors.bg }}>
        <section className="py-20 px-6" style={{ background: heroGradient }}>
          <div className="max-w-7xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6"
              style={{
                backgroundColor: `${colors.blue}20`,
                borderColor: `${colors.blue}40`,
                color: "#7cc8ff",
              }}
            >
              Our Partners
            </div>
            <h1
              className="font-display font-bold text-white mb-4"
              style={{ fontSize: "clamp(2rem,4vw,3.5rem)" }}
            >
              Connected to Nepal&apos;s
              <br />
              <span style={{ color: colors.teal }}>IT Ecosystem</span>
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
              Our hiring and technology partnerships ensure that what you learn at Next Minds is
              exactly what Nepal&apos;s top companies need.
            </p>
          </div>
        </section>

        <section
          className="py-14 px-6 border-b"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-5">
            {partnerTypes.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl p-6 text-center"
                style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
              >
                <div className="text-3xl mb-3"><p.icon size={26} aria-hidden="true" className="text-nm-teal-ink" /></div>
                <h3 className="font-semibold mb-1" style={{ color: colors.navy }}>
                  {p.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: colors.muted }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold" style={{ color: colors.navy }}>
                200+ Trusted Partners
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {grid.map((p, i) => (
                <div
                  key={`${p.name}-${i}`}
                  className="rounded-2xl p-5 flex flex-col items-center text-center transition-all hover:-translate-y-1"
                  style={{
                    backgroundColor: colors.card,
                    border: `1px solid ${colors.border}`,
                    boxShadow: "0 2px 8px rgba(13,45,82,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${colors.teal}40`;
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(13,45,82,0.10)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(13,45,82,0.04)";
                  }}
                >
                  <Building2 size={26} aria-hidden="true" className="mx-auto mb-2 text-nm-muted" />
                  <div className="font-semibold text-sm" style={{ color: colors.navy }}>
                    {p.name}
                  </div>
                  <div className="text-xs mt-1" style={{ color: colors.muted }}>
                    {p.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6" style={{ backgroundColor: colors.surface }}>
          <div className="max-w-2xl mx-auto">
            <div
              className="rounded-3xl p-8 lg:p-12 text-center"
              style={{ background: heroGradient }}
            >
              <Handshake size={36} aria-hidden="true" className="mx-auto mb-4 text-nm-teal-ink" />
              <h2 className="font-display font-bold text-white text-3xl mb-3">Become a Partner</h2>
              <p className="mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
                Whether you&apos;re a company looking to hire trained talent or a technology brand
                that wants curriculum presence — let&apos;s talk.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/contact"
                  className="font-bold px-8 py-4 rounded-xl text-white"
                  style={{ background: gradient }}
                >
                  Partner With Us
                </Link>
                <Link
                  href="/enterprise"
                  className="font-semibold px-8 py-4 rounded-xl transition-all"
                  style={{
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "rgba(255,255,255,0.85)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.teal;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                  }}
                >
                  Enterprise Training
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
