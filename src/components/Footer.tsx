"use client";

import { Clock, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { PublicCourse } from "@/db/queries";
import { contact, mailtoHref } from "@/lib/contact";
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

export default function Footer({ courses }: { courses: PublicCourse[] }) {
  return (
    <footer className="relative overflow-hidden border-t border-nm-border bg-nm-surface px-6 pt-14 pb-8">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-nm-teal/20 to-nm-blue/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Image
              src="/assets/logo-horizontal.png"
              alt="Next Minds Infosys"
              width={1959}
              height={356}
              sizes="240px"
              className="mb-5 h-11 w-auto object-contain"
            />
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-nm-muted">
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
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-nm-border bg-nm-card text-nm-muted transition-all hover:border-transparent hover:bg-gradient-to-br hover:from-nm-teal hover:to-nm-blue hover:text-white"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 text-sm font-semibold text-nm-navy">Courses</div>
            <div className="space-y-2.5">
              {courses.map((c) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  className="block text-sm text-nm-muted transition-colors hover:text-nm-teal-ink"
                >
                  {c.title}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 text-sm font-semibold text-nm-navy">Company</div>
            <div className="space-y-2.5">
              {companyFooterLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block text-sm text-nm-muted transition-colors hover:text-nm-teal-ink"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 text-sm font-semibold text-nm-navy">Contact</div>
            <div className="space-y-3">
              {contactRows.map((r) => (
                <div key={r.text} className="flex gap-3 text-sm text-nm-muted">
                  <r.icon size={16} aria-hidden="true" className="mt-0.5 flex-shrink-0 text-nm-teal-ink" />
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
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[#25d36630] bg-[#25d36615] px-3 py-2 text-xs font-semibold text-[#25d366] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d={whatsappPath} />
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-nm-border pt-6 sm:flex-row">
          <div className="text-sm text-nm-muted">
            © {new Date().getFullYear()} Next Minds Infosys Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-nm-muted">
            {["Privacy Policy", "Terms of Service"].map((t) => (
              <a key={t} href="#" className="transition-colors hover:text-nm-teal-ink">
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
