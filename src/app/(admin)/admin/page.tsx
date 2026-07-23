import { headers } from "next/headers";
import Link from "next/link";
import { BookOpen, ClipboardList, Mail, Building2, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { Course, Enrollment } from "@/db";
import { SubmissionStatus } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ContactSubmission } from "@/db/models/contact-submission";
import { EnterpriseInquiry } from "@/db/models/entrise-query";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const [
    courseCount,
    enrollmentCount,
    contactCount,
    enterpriseCount,
    pendingEnrollments,
    pendingContacts,
    recentEnrollments,
  ] = await Promise.all([
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
    { href: "/admin/courses", label: "Courses", icon: BookOpen, count: courseCount },
    { href: "/admin/enrollments", label: "Enrollments", icon: ClipboardList, count: enrollmentCount },
    { href: "/admin/contacts", label: "Contact Submissions", icon: Mail, count: contactCount },
    {
      href: "/admin/enterprise-inquiries",
      label: "Enterprise Inquiries",
      icon: Building2,
      count: enterpriseCount,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-teal-600">Next Minds Admin</p>
        <h1 className="text-2xl font-semibold text-gray-900 mt-1">
          Welcome back, {session?.user.name ?? "Admin"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage courses, enrollments, and inquiries for Nepal&apos;s IT training institute.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(20,184,166,0.15)] transition-shadow h-full">
              <CardHeader>
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-1">
                  <stat.icon size={18} />
                </div>
                <CardTitle className="text-3xl">{stat.count}</CardTitle>
                <CardDescription>{stat.label}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
            <div>
              <CardTitle className="text-2xl">{pendingEnrollments}</CardTitle>
              <CardDescription>Pending enrollments</CardDescription>
            </div>
          </CardHeader>
        </Card>
        <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail size={16} />
            </div>
            <div>
              <CardTitle className="text-2xl">{pendingContacts}</CardTitle>
              <CardDescription>Pending contact messages</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <CardHeader>
          <CardTitle>Recent enrollments</CardTitle>
          <CardDescription>Latest student applications from the public site</CardDescription>
        </CardHeader>
        <CardContent>
          {recentEnrollments.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No enrollments yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <p className="font-medium text-gray-900">{enrollment.fullName}</p>
                      <p className="text-xs text-gray-400">{enrollment.email}</p>
                    </TableCell>
                    <TableCell>{enrollment.course?.title ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={enrollment.status} />
                    </TableCell>
                    <TableCell>{enrollment.createdAt.toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
