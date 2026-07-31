import { Course, Enrollment } from "@/db";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { StatusSelect } from "@/components/admin/status-select";
import { DeleteRow } from "@/components/admin/delete-row-button";
import { updateEnrollmentStatus, deleteEnrollment } from "./actions";

export default async function AdminEnrollmentsPage() {
  const enrollments = await Enrollment.findAll({
    order: [["createdAt", "DESC"]],
    include: [{ model: Course, as: "course", attributes: ["title"] }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Enrollments</h1>
        <p className="text-sm text-gray-500 mt-1">Student applications from Enroll Now</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Has Laptop</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => (
            <TableRow key={enrollment.id}>
              <TableCell>
                <p className="font-medium text-gray-900">{enrollment.fullName}</p>
                <p className="text-xs text-gray-400">{enrollment.email}</p>
              </TableCell>
              <TableCell>{enrollment.course?.title ?? "—"}</TableCell>
              <TableCell>{enrollment.phone}</TableCell>
              <TableCell>{enrollment.learningFormat}</TableCell>
              <TableCell>{enrollment.hasLaptop}</TableCell>
              <TableCell>
                <StatusSelect
                  id={enrollment.id}
                  status={enrollment.status}
                  onUpdate={updateEnrollmentStatus}
                />
              </TableCell>
              <TableCell>{enrollment.createdAt.toLocaleDateString()}</TableCell>
              <TableCell>
                <DeleteRow id={enrollment.id} label={enrollment.fullName} action={deleteEnrollment} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
