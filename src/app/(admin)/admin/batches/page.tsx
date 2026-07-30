import Link from "next/link";
import { Batch, BatchStudent, Course, User } from "@/db";
import { listCourseOptions, listInstructorOptions } from "@/db/queries";
import { BatchForm } from "./batch-form";
import { BatchRowActions } from "./batch-actions";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default async function AdminBatchesPage() {
  const [batches, courses, instructors] = await Promise.all([
    Batch.findAll({
      include: [
        { model: Course, as: "course", attributes: ["title"] },
        { model: User, as: "instructor", attributes: ["name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    }),
    listCourseOptions(),
    listInstructorOptions(),
  ]);

  const counts = await BatchStudent.findAll({
    where: { status: "ACTIVE" },
    attributes: ["batchId"],
  });
  const sizeOf = (id: string) => counts.filter((c) => c.batchId === id).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Batches</h1>
        <p className="mt-1 text-sm text-gray-500">
          A batch runs one course with one instructor. Students are added by email.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <Link
                      href={`/admin/batches/${b.id}`}
                      className="font-medium text-teal-600 hover:text-teal-700"
                    >
                      {b.name}
                    </Link>
                    <p className="text-xs text-gray-400">{b.code}</p>
                  </TableCell>
                  <TableCell>{b.course?.title ?? "—"}</TableCell>
                  <TableCell>{b.instructor?.name ?? b.instructor?.email ?? "— unassigned —"}</TableCell>
                  <TableCell>
                    {sizeOf(b.id)}
                    {b.capacity > 0 ? ` / ${b.capacity}` : ""}
                  </TableCell>
                  <TableCell>{b.status}</TableCell>
                  <TableCell>
                    <BatchRowActions
                      courses={courses}
                      instructors={instructors}
                      batch={{
                        id: b.id,
                        name: b.name,
                        code: b.code,
                        courseId: b.courseId,
                        instructorId: b.instructorId ?? "",
                        startDate: b.startDate ?? "",
                        endDate: b.endDate ?? "",
                        schedule: b.schedule ?? "",
                        mode: b.mode,
                        capacity: b.capacity,
                        status: b.status,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {batches.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">
              No batches yet — create one on the right.
            </p>
          )}
        </div>

        <aside className="rounded-2xl bg-white p-6 ring-1 ring-gray-950/5 h-fit">
          <h2 className="mb-4 font-semibold text-gray-900">New batch</h2>
          {courses.length === 0 ? (
            <p className="text-sm text-gray-500">Create a course first.</p>
          ) : (
            <BatchForm courses={courses} instructors={instructors} />
          )}
        </aside>
      </div>
    </div>
  );
}
