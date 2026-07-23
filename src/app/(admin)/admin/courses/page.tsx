import { Course, Enrollment } from "@/db";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PublishToggle } from "./publish-toggle";

export default async function AdminCoursesPage() {
  const courses = await Course.findAll({
    order: [["createdAt", "DESC"]],
    include: [{ model: Enrollment, as: "enrollments", attributes: ["id"] }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>
        <p className="text-sm text-gray-500 mt-1">Industry-aligned programs from Next Minds</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Enrollments</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium text-gray-900">{course.title}</TableCell>
              <TableCell>{course.category}</TableCell>
              <TableCell>{course.level}</TableCell>
              <TableCell>{course.price}</TableCell>
              <TableCell>{course.enrollments?.length ?? 0}</TableCell>
              <TableCell>
                <PublishToggle id={course.id} published={course.published} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
