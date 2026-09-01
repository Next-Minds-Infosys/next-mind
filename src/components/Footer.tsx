"use client";

import { Clock, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CourseCard } from "@/db/queries";
import { contact, mailtoHref } from "@/lib/contact";
import { borderSoft, colors } from "@/lib/theme";
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
  // The address links to the Google Business listing - the fastest path to
  // directions from a phone, and a signal tying the site to the listing.
  { icon: MapPin, text: contact.address.full, href: contact.maps.place },
  { icon: Mail, text: contact.email, href: mailtoHref },
  { icon: Clock, text: contact.hours, href: null },
];

/** Column heading - same treatment in all three link columns. */
function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3.5 text-[13.5px] font-extrabold" style={{ color: colors.navy }}>
      {children}
    </div>
  );
}

const linkClass =
  "text-[13.5px] transition-colors hover:text-nm-teal-ink";

export default function Footer({ courses }: { courses: CourseCard[] }) {
  return (
    // White with a hairline rule, per the design. The previous footer sat on a
    // tinted panel behind a large teal/blue blur; the design ends the page on
    // the dark CTA band instead, so anything decorative here competes with it.
    <footer
      className="px-6 pt-[50px] pb-[26px]"
      style={{ backgroundColor: colors.bg, borderTop: `1px solid ${borderSoft}` }}
    >
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-9 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr]">
        <div>
          <Image
            src="/assets/logo-horizontal.png"
            alt="Next Minds Infosys"
            width={1959}
            height={356}
            sizes="220px"
            className="mb-3.5 h-9 w-auto object-contain"
          />
          <p
            className="mb-4 max-w-[280px] text-[13.5px] leading-[1.6]"
            style={{ color: colors.muted }}
          >
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
                className="flex h-8 w-8 items-center justify-center rounded-[9px] transition-colors hover:text-white"
                style={{ backgroundColor: "#f4f5f7", color: colors.body }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #00c29a, #0095de)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f4f5f7";
                  e.currentTarget.style.color = colors.body;
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <ColTitle>Courses</ColTitle>
          <div className="flex flex-col gap-2.5">
            {courses.map((c) => (
              <Link
                key={c.id}
                href={`/courses/${c.slug}`}
                className={linkClass}
                style={{ color: colors.muted }}
              >
                {c.title}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <ColTitle>Company</ColTitle>
          <div className="flex flex-col gap-2.5">
            {companyFooterLinks.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass} style={{ color: colors.muted }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <ColTitle>Contact</ColTitle>
          <div className="flex flex-col gap-2.5">
            {contactRows.map((r) => (
              <div key={r.text} className="flex gap-2.5 text-[13.5px]" style={{ color: colors.muted }}>
                <r.icon size={15} aria-hidden="true" className="mt-0.5 flex-shrink-0 text-nm-teal-ink" />
                {r.href ? (
                  <a
                    href={r.href}
                    target={r.href.startsWith("http") ? "_blank" : undefined}
                    rel={r.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="transition-colors hover:text-nm-teal-ink hover:underline"
                  >
                    {r.text}
                  </a>
                ) : (
                  <span>{r.text}</span>
                )}
              </div>
            ))}
            <a
              href={contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-2 text-[13.5px] font-bold transition-colors"
              style={{ color: colors.tealInk }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d={whatsappPath} />
              </svg>
              Chat on WhatsApp →
            </a>
          </div>
        </div>
      </div>

      <div
        className="mx-auto mt-10 flex max-w-[1240px] flex-col items-center justify-between gap-3 pt-6 sm:flex-row"
        style={{ borderTop: `1px solid ${borderSoft}` }}
      >
        <div className="text-[12.5px]" style={{ color: colors.mutedSoft }}>
          © {new Date().getFullYear()} Next Minds Infosys Pvt. Ltd. All rights reserved.
        </div>
        <div className="flex gap-5 text-[12.5px]" style={{ color: colors.mutedSoft }}>
          {["Privacy Policy", "Terms of Service"].map((t) => (
            <a key={t} href="#" className="transition-colors hover:text-nm-teal-ink">
              {t}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
