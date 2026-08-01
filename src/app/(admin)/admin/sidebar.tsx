"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Tags,
  BookOpen,
  ClipboardList,
  Mail,
  Building2,
  Users,
  X,
  GraduationCap,
  UserCog,
  Newspaper,
  ReceiptText,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RESOURCES, canAccess, type PermissionMap } from "@/lib/policies";

/** Grouped so the finance section reads as its own area of the business. */
const navGroups = [
  {
    heading: null,
    links: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, resource: RESOURCES.DASHBOARD }],
  },
  {
    heading: "Teaching",
    links: [
      { href: "/admin/categories", label: "Categories", icon: Tags, resource: RESOURCES.CATEGORIES },
      { href: "/admin/courses", label: "Courses", icon: BookOpen, resource: RESOURCES.COURSES },
      { href: "/admin/batches", label: "Batches", icon: GraduationCap, resource: RESOURCES.BATCHES },
      { href: "/admin/mentors", label: "Mentors", icon: Users, resource: RESOURCES.MENTORS },
    ],
  },
  {
    heading: "Next Minds",
    links: [
      { href: "/admin/billing", label: "Billing", icon: ReceiptText, resource: RESOURCES.BILLING },
      { href: "/admin/expenses", label: "Expenses", icon: Wallet, resource: RESOURCES.EXPENSES },
    ],
  },
  {
    heading: "Content & leads",
    links: [
      { href: "/admin/blog", label: "Blog", icon: Newspaper, resource: RESOURCES.BLOG },
      { href: "/admin/enrollments", label: "Enrollments", icon: ClipboardList, resource: RESOURCES.ENROLLMENTS },
      { href: "/admin/contacts", label: "Contacts", icon: Mail, resource: RESOURCES.CONTACTS },
      {
        href: "/admin/enterprise-inquiries",
        label: "Enterprise Inquiries",
        icon: Building2,
        resource: RESOURCES.ENTERPRISE_INQUIRIES,
      },
    ],
  },
  {
    heading: "System",
    links: [
      { href: "/admin/users", label: "Users", icon: UserCog, resource: RESOURCES.USERS },
      { href: "/admin/policies", label: "Policies", icon: ShieldCheck, resource: RESOURCES.POLICIES },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  permissions: PermissionMap;
}

export function Sidebar({ open, onClose, permissions }: SidebarProps) {
  const pathname = usePathname();
  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => canAccess(permissions, link.resource)),
    }))
    .filter((group) => group.links.length > 0);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-950/5 bg-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-gray-950/5 px-5">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
            <Image
              src="/assets/logo-horizontal.png"
              alt="Next Minds"
              width={1959}
              height={356}
              className="h-8 w-auto"
            />
            <Badge variant="gradient" className="text-xs">
              Admin
            </Badge>
          </Link>
          <button
            className="text-gray-400 hover:text-gray-700 lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto p-3 pb-8" style={{ maxHeight: "calc(100vh - 4rem)" }}>
          {visibleGroups.map((group) => (
            <div key={group.heading ?? "root"} className={group.heading ? "mt-4" : ""}>
              {group.heading && (
                <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {group.heading}
                </p>
              )}
              <div className="flex flex-col gap-1">
                {group.links.map((link) => {
                  const active = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-teal-50 text-teal-700"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                      }`}
                    >
                      <Icon size={18} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
