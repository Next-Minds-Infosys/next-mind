"use client";

import Image from "next/image";
import Link from "next/link";
import type { PublicCourse } from "@/db/queries";
import { colors, gradient } from "@/lib/theme";
import { contact } from "@/lib/contact";
import { socialLinks, whatsappPath } from "./SocialIcons";

const companyFooterLinks = [
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/success-stories", label: "Success Stories" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/partners", label: "Partners" },
  { href: "/enterprise", label: "Enterprise" },
];

const contactRows = [
  { icon: "📍", text: "New Baneshwor, Kathmandu, Nepal" },
  { icon: "✉️", text: contact.email },
  { icon: "🕐", text: "Sun–Fri: 9 AM – 6 PM" },
];

export default function Footer({ courses }: { courses: PublicCourse[] }) {
  return (
    <footer
      className="border-t pt-14 pb-8 px-6"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Image
              src="/assets/logo-horizontal.png"
              alt="Next Minds Infosys"
              width={1959}
              height={356}
              sizes="240px"
              className="h-11 w-auto object-contain mb-5"
            />
            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: colors.muted }}>
              Empowering Nepal&apos;s future tech leaders with world-class IT training, mentorship,
              and career support.
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  style={{
                    backgroundColor: colors.card,
                    border: `1px solid ${colors.border}`,
                    color: colors.muted,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = gradient;
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.card;
                    e.currentTarget.style.color = colors.muted;
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="font-semibold mb-4 text-sm" style={{ color: colors.navy }}>
              Courses
            </div>
            <div className="space-y-2.5">
              {courses.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  className="block text-sm transition-colors"
                  style={{ color: colors.muted }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.teal;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.muted;
                  }}
                >
                  {c.title}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="font-semibold mb-4 text-sm" style={{ color: colors.navy }}>
              Company
            </div>
            <div className="space-y-2.5">
              {companyFooterLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block text-sm transition-colors"
                  style={{ color: colors.muted }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.teal;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.muted;
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="font-semibold mb-4 text-sm" style={{ color: colors.navy }}>
              Contact
            </div>
            <div className="space-y-3">
              {contactRows.map((r) => (
                <div key={r.text} className="flex gap-3 text-sm" style={{ color: colors.muted }}>
                  <span className="flex-shrink-0">{r.icon}</span>
                  <span>{r.text}</span>
                </div>
              ))}
              <a
                href={contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg transition-all mt-2"
                style={{
                  backgroundColor: "#25d36615",
                  border: "1px solid #25d36630",
                  color: "#25d366",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d={whatsappPath} />
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div
          className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderColor: colors.border }}
        >
          <div className="text-sm" style={{ color: colors.muted }}>
            © 2025 Next Minds Infosys Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm" style={{ color: colors.muted }}>
            {["Privacy Policy", "Terms of Service"].map((t) => (
              <a
                key={t}
                href="#"
                className="transition-colors"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.teal;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.muted;
                }}
              >
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
