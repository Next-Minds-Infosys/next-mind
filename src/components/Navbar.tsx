"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { companyLinks } from "@/data/courses";
import LoginModal from "./LoginModal";

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

function NavLink({
  href,
  label,
  isActive,
  hovered,
  onHover,
}: {
  href: string;
  label: string;
  isActive: boolean;
  hovered: boolean;
  onHover: (href: string | null) => void;
}) {
  return (
    <Link
      href={href}
      className={`relative rounded-lg px-3.5 py-2 text-[14.5px] font-semibold transition-colors ${
        isActive ? "text-nm-teal-ink" : "text-nm-body hover:text-nm-teal-ink"
      }`}
      onMouseEnter={() => onHover(href)}
      onMouseLeave={() => onHover(null)}
    >
      {label}
      {(isActive || hovered) && (
        <motion.span
          layoutId="navbar-underline"
          className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full nm-gradient"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [loginOpen, setLoginOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
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
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 backdrop-blur-md ${
        scrolled ? "border-nm-border bg-white/95 shadow-[0_2px_24px_rgba(13,45,82,0.08)]" : "border-transparent bg-white/80"
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1240px] items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <Link href="/" className="flex flex-shrink-0 items-center">
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

        <div className="hidden items-center gap-1 md:flex" onMouseLeave={() => setHovered(null)}>
          {mainLinks.map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              label={l.label}
              isActive={isActive(l.href)}
              hovered={hovered === l.href}
              onHover={setHovered}
            />
          ))}

          <div className="relative" ref={companyRef}>
            <button
              type="button"
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                companyOpen ? "bg-nm-light text-nm-teal-ink" : "text-nm-body hover:text-nm-teal-ink"
              }`}
              onClick={() => setCompanyOpen((v) => !v)}
            >
              Company
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${companyOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {companyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 min-w-[220px] rounded-2xl border border-nm-border bg-nm-card py-2 shadow-[0_16px_48px_rgba(13,45,82,0.12)]"
                >
                  {companyLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`mx-1 flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors hover:bg-nm-surface hover:text-nm-teal-ink ${
                        isActive(l.href) ? "text-nm-teal-ink" : "text-nm-body"
                      }`}
                    >
                      <l.icon size={18} aria-hidden="true" className="shrink-0 text-nm-teal-ink" />
                      <span className="font-medium">{l.label}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavLink
            href="/contact"
            label="Contact"
            isActive={isActive("/contact")}
            hovered={hovered === "/contact"}
            onHover={setHovered}
          />
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {/* One entry point for students and instructors. Admins sign in at
              /admin directly - deliberately unadvertised in the public nav. */}
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-nm-body transition-colors hover:text-nm-teal-ink"
          >
            Sign In
          </button>
          <Link
            href="/courses"
            className="nm-gradient rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(0,189,184,0.25)] transition-all active:scale-95"
          >
            Enroll Now
          </Link>
        </div>

        <button
          type="button"
          className="p-1 text-nm-navy md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <div className="flex w-6 flex-col gap-1.5">
            {[
              mobileOpen ? "rotate-45 translate-y-2" : "",
              mobileOpen ? "opacity-0 scale-x-0" : "",
              mobileOpen ? "-rotate-45 -translate-y-2" : "",
            ].map((cls, i) => (
              <span
                key={i}
                className={`h-0.5 w-full rounded bg-nm-navy transition-all duration-300 ${cls}`}
              />
            ))}
          </div>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-nm-border bg-white md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-5">
              {mobileLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                    isActive(l.href) ? "text-nm-teal-ink" : "text-nm-body"
                  }`}
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
                className="px-3 py-2.5 text-left text-base font-medium text-nm-body"
              >
                Sign In
              </button>
              <Link
                href="/courses"
                className="nm-gradient mt-3 block rounded-xl px-6 py-3 text-center font-bold text-white"
              >
                Enroll Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </nav>
  );
}
