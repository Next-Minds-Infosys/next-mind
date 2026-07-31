import { notFound } from "next/navigation";
import Link from "next/link";
import { Batch, BatchStudent, Course, User } from "@/db";
import { listCourseOptions, listEnrollableStudents, listInstructorOptions } from "@/db/queries";
import { BatchForm } from "../batch-form";
import { Roster } from "./roster";
import { InstructorPicker } from "./instructor-picker";

export default async function AdminBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [batch, courses, instructors, candidates, memberships] = await Promise.all([
    Batch.findByPk(id, { include: [{ model: Course, as: "course", attributes: ["title"] }] }),
    listCourseOptions(),
    listInstructorOptions(),
    listEnrollableStudents(id),
    BatchStudent.findAll({
      where: { batchId: id, status: "ACTIVE" },
      include: [{ model: User, as: "user", attributes: ["name", "email"] }],
      order: [["enrolledAt", "DESC"]],
    }),
  ]);

  if (!batch) notFound();

  const students = memberships.map((m) => ({
    membershipId: m.id,
    name: m.user?.name ?? null,
    email: m.user?.email ?? "",
    enrolledAt: m.enrolledAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/batches" className="text-sm text-teal-600 hover:text-teal-700">
          ← All batches
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">{batch.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {batch.code} · {batch.course?.title} · {batch.mode} · {batch.status}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 ring-1 ring-gray-950/5">
          <h2 className="mb-4 font-semibold text-gray-900">Details</h2>
          <BatchForm
            courses={courses}
            instructors={instructors}
            initial={{
              id: batch.id,
              courseId: batch.courseId,
              instructorId: batch.instructorId ?? "",
              name: batch.name,
              code: batch.code,
              startDate: batch.startDate ?? "",
              endDate: batch.endDate ?? "",
              schedule: batch.schedule ?? "",
              mode: batch.mode,
              capacity: batch.capacity,
              status: batch.status,
            }}
          />
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-950/5">
            <h2 className="mb-1 font-semibold text-gray-900">Teacher</h2>
            <p className="mb-4 text-sm text-gray-500">
              Who runs this batch. They get it in their instructor portal.
            </p>
            <InstructorPicker
              batchId={batch.id}
              current={batch.instructorId}
              instructors={instructors}
            />
          </div>

          <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-950/5">
            <h2 className="mb-1 font-semibold text-gray-900">
              Roster <span className="text-gray-400">({students.length})</span>
            </h2>
            <p className="mb-4 text-sm text-gray-500">
              Pick from registered students. Accounts are created under{" "}
              <Link href="/admin/users" className="font-medium text-teal-600 hover:text-teal-700">
                Users
              </Link>
              .
            </p>
            <Roster
              batchId={batch.id}
              students={students}
              candidates={candidates}
              full={batch.capacity > 0 && students.length >= batch.capacity}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
