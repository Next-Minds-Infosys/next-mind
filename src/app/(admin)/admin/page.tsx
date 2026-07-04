import { headers } from "next/headers";
import Link from "next/link";
import { BookOpen, ClipboardList, Mail, Building2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const stats = [
  { href: "/admin/courses", label: "Courses", icon: BookOpen, query: () => prisma.course.count() },
  { href: "/admin/enrollments", label: "Enrollments", icon: ClipboardList, query: () => prisma.enrollment.count() },
  { href: "/admin/contacts", label: "Contact Submissions", icon: Mail, query: () => prisma.contactSubmission.count() },
  { href: "/admin/enterprise-inquiries", label: "Enterprise Inquiries", icon: Building2, query: () => prisma.enterpriseInquiry.count() },
];

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const counts = await Promise.all(stats.map((s) => s.query()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {session?.user.name ?? "Admin"}</h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s a quick overview of Next Minds.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(20,184,166,0.15)] transition-shadow h-full">
              <CardHeader>
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-1">
                  <stat.icon size={18} />
                </div>
                <CardTitle className="text-3xl">{counts[i]}</CardTitle>
                <CardDescription>{stat.label}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
