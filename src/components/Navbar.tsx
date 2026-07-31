"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { companyLinks } from "@/data/courses";
import LoginModal from "./LoginModal";
import { colors, gradient } from "@/lib/theme";

const mainLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Enterprise", href: "/enterprise" },
];

const mobileLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/enterprise", label: "Enterprise" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/success-stories", label: "Success Stories" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/partners", label: "Partners" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [loginOpen, setLoginOpen] = useState(false);
  const companyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setCompanyOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
    setCompanyOpen(false);
  }

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: "rgba(255,255,255,0.97)",
        borderBottom: `1px solid ${scrolled ? colors.border : "#f0f5fa"}`,
        boxShadow: scrolled ? "0 2px 24px rgba(13,45,82,0.08)" : "none",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image
            src="/assets/logo-horizontal.png"
            alt="Next Minds Infosys"
            width={1959}
            height={356}
            sizes="200px"
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {mainLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors relative"
              style={{
                color: isActive(l.href) ? colors.teal : colors.body,
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                if (isActive(l.href)) return;
                e.currentTarget.style.color = colors.teal;
                e.currentTarget.style.backgroundColor = colors.light;
              }}
              onMouseLeave={(e) => {
                if (isActive(l.href)) return;
                e.currentTarget.style.color = colors.body;
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {l.label}
              {isActive(l.href) && (
                <span
                  className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full"
                  style={{ background: gradient }}
                />
              )}
            </Link>
          ))}

          <div className="relative" ref={companyRef}>
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{
                color: companyOpen ? colors.teal : colors.body,
                backgroundColor: companyOpen ? colors.light : "transparent",
              }}
              onClick={() => setCompanyOpen((v) => !v)}
            >
              Company
              <svg
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{ transform: companyOpen ? "rotate(180deg)" : "none" }}
                viewBox="0 0 12 8"
                fill="none"
              >
                <path
                  d="M1 1l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {companyOpen && (
              <div
                className="absolute top-full left-0 mt-2 rounded-2xl py-2 min-w-[220px]"
                style={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  boxShadow: "0 16px 48px rgba(13,45,82,0.12)",
                }}
              >
                {companyLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm mx-1 rounded-lg transition-colors"
                    style={{ color: isActive(l.href) ? colors.teal : colors.body }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.surface;
                      e.currentTarget.style.color = colors.teal;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = isActive(l.href) ? colors.teal : colors.body;
                    }}
                  >
                    <span>{l.icon}</span>
                    <span className="font-medium">{l.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/contact"
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors relative"
            style={{
              color: isActive("/contact") ? colors.teal : colors.body,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              if (isActive("/contact")) return;
              e.currentTarget.style.color = colors.teal;
              e.currentTarget.style.backgroundColor = colors.light;
            }}
            onMouseLeave={(e) => {
              if (isActive("/contact")) return;
              e.currentTarget.style.color = colors.body;
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Contact
            {isActive("/contact") && (
              <span
                className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full"
                style={{ background: gradient }}
              />
            )}
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {/* One entry point for students and instructors. Admins sign in at
              /admin directly - deliberately unadvertised in the public nav. */}
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ color: colors.body }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.teal;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.body;
            }}
          >
            Sign In
          </button>
          <Link
            href="/courses"
            className="text-sm font-bold px-6 py-2.5 rounded-xl text-white transition-all active:scale-95"
            style={{ background: gradient, boxShadow: `0 4px 16px ${colors.teal}40` }}
          >
            Enroll Now
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden p-1"
          style={{ color: colors.navy }}
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <div className="w-6 flex flex-col gap-1.5">
            {[
              mobileOpen ? "rotate-45 translate-y-2" : "",
              mobileOpen ? "opacity-0 scale-x-0" : "",
              mobileOpen ? "-rotate-45 -translate-y-2" : "",
            ].map((cls, i) => (
              <span
                key={i}
                className={`h-0.5 w-full rounded transition-all duration-300 ${cls}`}
                style={{ backgroundColor: colors.navy }}
              />
            ))}
          </div>
        </button>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-[36rem] opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ borderTop: `1px solid ${colors.border}`, backgroundColor: colors.bg }}
      >
        <div className="px-6 py-5 flex flex-col gap-1">
          {mobileLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="py-2.5 text-base font-medium rounded-lg px-3 transition-colors block"
              style={{ color: isActive(l.href) ? colors.teal : colors.body }}
            >
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              setLoginOpen(true);
            }}
            className="py-2.5 text-base font-medium rounded-lg px-3 text-left"
            style={{ color: colors.body }}
          >
            Sign In
          </button>
          <Link
            href="/courses"
            className="font-bold px-6 py-3 rounded-xl mt-3 text-white text-center block"
            style={{ background: gradient }}
          >
            Enroll Now
          </Link>
        </div>
      </div>
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </nav>
  );
}
