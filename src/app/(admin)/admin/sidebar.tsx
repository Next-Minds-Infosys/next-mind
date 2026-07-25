"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Tags, BookOpen, ClipboardList, Mail, Building2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/enrollments", label: "Enrollments", icon: ClipboardList },
  { href: "/admin/contacts", label: "Contacts", icon: Mail },
  { href: "/admin/enterprise-inquiries", label: "Enterprise Inquiries", icon: Building2 },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

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
            <Image src="/next-minds-logo.png" alt="Next Minds" width={100} height={40} className="h-8 w-auto" />
            <Badge variant="gradient" className="text-xs">
              Admin
            </Badge>
          </Link>
          <button className="text-gray-400 hover:text-gray-700 lg:hidden" onClick={onClose} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-teal-50 text-teal-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
