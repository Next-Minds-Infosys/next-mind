import Link from "next/link";
import {
  Tags,
  BookOpen,
  ClipboardList,
  Mail,
  Building2,
  Clock,
  ArrowRight,
  Inbox,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import {
  Category,
  ContactSubmission,
  Course,
  Enrollment,
  EnterpriseInquiry,
} from "@/db";
import { SubmissionStatus } from "@/lib/types";
import { requireResource } from "@/lib/access";
import { RESOURCES } from "@/lib/policies";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

// Hairline surface. Tailwind v4 renders an uncoloured `border` as currentColor,
// so cards use a light ring instead.
const RING = "ring-1 ring-gray-950/5";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2";

function relativeDate(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminDashboardPage() {
  await requireResource(RESOURCES.DASHBOARD);
  const session = await getSession();

  const [
    categoryCount,
    courseCount,
    enrollmentCount,
    contactCount,
    enterpriseCount,
    pendingEnrollments,
    pendingContacts,
    recentEnrollments,
  ] = await Promise.all([
    Category.count(),
    Course.count(),
    Enrollment.count(),
    ContactSubmission.count(),
    EnterpriseInquiry.count(),
    Enrollment.count({ where: { status: SubmissionStatus.PENDING } }),
    ContactSubmission.count({ where: { status: SubmissionStatus.PENDING } }),
    Enrollment.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
      include: [{ model: Course, as: "course", attributes: ["title"] }],
    }),
  ]);

  const stats = [
    {
      href: "/admin/categories",
      label: "Categories",
      icon: Tags,
      count: categoryCount,
      tint: "bg-violet-50 text-violet-600",
    },
    {
      href: "/admin/courses",
      label: "Courses",
      icon: BookOpen,
      count: courseCount,
      tint: "bg-teal-50 text-teal-600",
    },
    {
      href: "/admin/enrollments",
      label: "Enrollments",
      icon: ClipboardList,
      count: enrollmentCount,
      tint: "bg-blue-50 text-blue-600",
    },
    {
      href: "/admin/contacts",
      label: "Contacts",
      icon: Mail,
      count: contactCount,
      tint: "bg-amber-50 text-amber-600",
    },
    {
      href: "/admin/enterprise-inquiries",
      label: "Enterprise",
      icon: Building2,
      count: enterpriseCount,
      tint: "bg-rose-50 text-rose-600",
    },
  ];

  const needsAttention = [
    {
      href: "/admin/enrollments",
      count: pendingEnrollments,
      label: "Pending enrollments",
      hint: "Applications awaiting review",
      icon: Clock,
      tint: "bg-amber-50 text-amber-600",
    },
    {
      href: "/admin/contacts",
      count: pendingContacts,
      label: "Pending messages",
      hint: "Contact submissions not yet handled",
      icon: Mail,
      tint: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm font-medium text-teal-600">Next Minds Admin</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
          Welcome back, {session?.user.name ?? "Admin"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage courses, enrollments, and inquiries for Nepal&apos;s IT training institute.
        </p>
      </header>

      {/* Overview */}
      <section aria-labelledby="overview-heading" className="space-y-3">
        <h2 id="overview-heading" className="text-sm font-semibold text-gray-900">
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {stats.map((stat) => (
            <Link key={stat.href} href={stat.href} className={`group block rounded-2xl ${FOCUS}`}>
              <Card
                className={`${RING} h-full transition hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(20,184,166,0.10)] hover:ring-teal-500/30`}
              >
                <CardContent className="flex h-full flex-col p-6">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.tint}`}
                  >
                    <stat.icon size={18} />
                  </span>
                  <p className="mt-5 text-3xl font-semibold tabular-nums tracking-tight text-gray-900">
                    {stat.count.toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Needs attention */}
      <section aria-labelledby="attention-heading" className="space-y-3">
        <h2 id="attention-heading" className="text-sm font-semibold text-gray-900">
          Needs attention
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {needsAttention.map((item) => (
            <Link key={item.label} href={item.href} className={`group block rounded-2xl ${FOCUS}`}>
              <Card className={`${RING} transition hover:ring-gray-950/10`}>
                <CardContent className="flex items-center gap-4 p-5">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.tint}`}
                  >
                    <item.icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-2xl font-semibold leading-tight tabular-nums text-gray-900">
                      {item.count.toLocaleString()}
                    </span>
                    <span className="block text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="block truncate text-xs text-gray-500">{item.hint}</span>
                  </span>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-teal-600"
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent enrollments */}
      <section aria-labelledby="recent-heading">
        <Card className={`${RING} overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <h2 id="recent-heading" className="font-semibold text-gray-900">
                Recent enrollments
              </h2>
              <p className="text-sm text-gray-500">
                Latest student applications from the public site
              </p>
            </div>
            <Link
              href="/admin/enrollments"
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-teal-600 transition hover:text-teal-700 ${FOCUS}`}
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentEnrollments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 border-t border-gray-950/5 px-5 py-12 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                <Inbox size={20} />
              </span>
              <p className="text-sm font-medium text-gray-700">No enrollments yet</p>
              <p className="max-w-xs text-sm text-gray-500">
                Applications submitted through the Enroll Now form will appear here.
              </p>
            </div>
          ) : (
            <Table bare className="border-t border-gray-950/5">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="pl-5">
                      <p className="font-medium text-gray-900">{enrollment.fullName}</p>
                      <p className="text-xs text-gray-500">{enrollment.email}</p>
                    </TableCell>
                    <TableCell>{enrollment.course?.title ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={enrollment.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap pr-5 text-gray-500">
                      {relativeDate(enrollment.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </section>
    </div>
  );
}
