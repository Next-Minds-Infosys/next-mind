"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Receipt,
  UserRound,
  X,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";

/**
 * Icons are resolved here, on the client, from a plain string key.
 *
 * The portal layouts are server components. Passing a Lucide component across
 * that boundary throws "Only plain objects can be passed to Client Components"
 * - a Lucide icon is a forwardRef object with a `render` function, which React
 * cannot serialise. A string key survives serialisation; the lookup happens
 * after hydration.
 */
const ICONS = {
  dashboard: LayoutDashboard,
  batches: Library,
  assignments: ClipboardList,
  grades: GraduationCap,
  payments: Receipt,
  profile: UserRound,
} satisfies Record<string, LucideIcon>;

export type NavIcon = keyof typeof ICONS;

export interface NavItem {
  href: string;
  label: string;
  /** Key into ICONS above - not a component, so this stays serialisable. */
  icon: NavIcon;
}

/**
 * Navigation frame for the student and instructor portals.
 *
 * Both were previously bare pages - no way back to the dashboard, and no way to
 * sign out at all except clearing cookies. One shell, two link sets.
 */
export function PortalShell({
  role,
  name,
  email,
  nav,
  profileHref,
  children,
}: {
  role: string;
  name: string;
  email: string;
  nav: NavItem[];
  /** Staff roles only - links the footer identity block to the self-service profile editor. */
  profileHref?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Longest-prefix match, so /student/batches/abc keeps "My batches" lit
  // instead of also lighting the /student dashboard link.
  const activeHref = nav
    .filter((n) => pathname === n.href || pathname.startsWith(n.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const link = (n: NavItem, onClick?: () => void) => {
    const Icon = ICONS[n.icon];
    return (
    <Link
      key={n.href}
      href={n.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        n.href === activeHref
          ? "bg-teal-50 text-teal-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon size={18} aria-hidden="true" className="shrink-0" />
      {n.label}
    </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile bar */}
      <div className="flex items-center justify-between border-b border-gray-950/5 bg-white px-4 py-3 lg:hidden">
        <Link href={nav[0]?.href ?? "/"} className="flex items-center">
          <Image
            src="/assets/logo-horizontal.png"
            alt="Next Minds"
            width={1959}
            height={356}
            className="h-7 w-auto"
          />
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <aside
        className={`${open ? "block" : "hidden"} border-b border-gray-950/5 bg-white lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:flex-shrink-0 lg:border-b-0 lg:border-r`}
      >
        <div className="flex h-full flex-col">
          <div className="hidden h-16 items-center border-b border-gray-950/5 px-5 lg:flex">
            <Link href={nav[0]?.href ?? "/"}>
              <Image
                src="/assets/logo-horizontal.png"
                alt="Next Minds"
                width={1959}
                height={356}
                className="h-7 w-auto"
              />
            </Link>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {role}
            </p>
            {nav.map((n) => link(n, () => setOpen(false)))}
          </nav>

          <div className="border-t border-gray-950/5 p-3">
            {profileHref ? (
              <Link href={profileHref} className="block rounded-xl px-3 py-2 hover:bg-gray-100">
                <p className="truncate text-sm font-medium text-gray-900">{name}</p>
                <p className="truncate text-xs text-gray-500">{email}</p>
              </Link>
            ) : (
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium text-gray-900">{name}</p>
                <p className="truncate text-xs text-gray-500">{email}</p>
              </div>
            )}
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push("/");
                router.refresh();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
