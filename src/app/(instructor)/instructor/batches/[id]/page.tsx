import Link from "next/link";
import { Assignment, BatchStudent, Course, Lesson, Material, Message, Submission, User } from "@/db";
import { requireRole, assertInstructorOwnsBatch } from "@/lib/access";
import { Role } from "@/lib/types";
import { AddAssignment, AddLesson, AddMaterial, Announce, GradeForm } from "./workspace";

const panel = "rounded-2xl bg-white p-6 ring-1 ring-gray-950/5";

export default async function InstructorBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireRole(Role.INSTRUCTOR, Role.ADMIN);
  // Redirects unless this batch is genuinely theirs.
  const batch = await assertInstructorOwnsBatch(id, session.user.id);

  const [course, roster, lessons, materials, assignments, messages] = await Promise.all([
    Course.findByPk(batch.courseId, { attributes: ["title"] }),
    BatchStudent.findAll({
      where: { batchId: id, status: "ACTIVE" },
      include: [{ model: User, as: "user", attributes: ["name", "email"] }],
    }),
    Lesson.findAll({ where: { batchId: id }, order: [["createdAt", "DESC"]] }),
    Material.findAll({ where: { batchId: id }, order: [["createdAt", "DESC"]] }),
    Assignment.findAll({
      where: { batchId: id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Submission,
          as: "submissions",
          include: [{ model: User, as: "user", attributes: ["name", "email"] }],
        },
      ],
    }),
    Message.findAll({
      where: { batchId: id },
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "author", attributes: ["name", "email"] }],
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <header>
        <Link href="/instructor" className="text-sm text-teal-600 hover:text-teal-700">
          ← My batches
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">{batch.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {batch.code} · {course?.title} · {roster.length} students
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <AddLesson batchId={id} />
        <AddMaterial batchId={id} />
        <AddAssignment batchId={id} />
        <Announce batchId={id} />
      </div>

      <section className={panel}>
        <h2 className="mb-4 font-semibold text-gray-900">Lessons ({lessons.length})</h2>
        {lessons.length === 0 ? (
          <p className="text-sm text-gray-500">No lessons yet.</p>
        ) : (
          <ul className="divide-y divide-gray-950/5">
            {lessons.map((l) => (
              <li key={l.id} className="py-3">
                <p className="font-medium text-gray-900">{l.title}</p>
                <p className="text-xs text-gray-500">
                  {l.videoKey ? "Video attached" : "No video"} ·{" "}
                  {l.published ? "Published" : "Draft"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={panel}>
        <h2 className="mb-4 font-semibold text-gray-900">Files ({materials.length})</h2>
        {materials.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing shared yet.</p>
        ) : (
          <ul className="divide-y divide-gray-950/5">
            {materials.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">{m.title}</p>
                  <p className="text-xs text-gray-500">{m.fileName}</p>
                </div>
                <a
                  href={`/api/media/${m.storageKey}`}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  Open
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={panel}>
        <h2 className="mb-4 font-semibold text-gray-900">Assignments &amp; submissions</h2>
        {assignments.length === 0 ? (
          <p className="text-sm text-gray-500">No assignments yet.</p>
        ) : (
          <div className="space-y-6">
            {assignments.map((a) => (
              <div key={a.id}>
                <p className="font-medium text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-500">
                  {a.dueAt ? `Due ${a.dueAt.toLocaleString()}` : "No due date"} · max {a.maxScore} ·{" "}
                  {a.submissions?.length ?? 0}/{roster.length} submitted
                </p>
                <ul className="mt-3 space-y-3">
                  {(a.submissions ?? []).map((s) => (
                    <li key={s.id} className="rounded-xl bg-gray-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {s.user?.name ?? s.user?.email}
                        </span>
                        {s.storageKey && (
                          <a
                            href={`/api/media/${s.storageKey}`}
                            className="text-sm text-teal-600 hover:text-teal-700"
                          >
                            Download {s.fileName}
                          </a>
                        )}
                      </div>
                      {s.note && <p className="mt-1 text-xs text-gray-600">{s.note}</p>}
                      <GradeForm
                        batchId={id}
                        submissionId={s.id}
                        maxScore={a.maxScore}
                        score={s.score}
                        feedback={s.feedback}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={panel}>
        <h2 className="mb-4 font-semibold text-gray-900">Messages</h2>
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing posted yet.</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m.id} className={m.parentId ? "ml-6 rounded-xl bg-gray-50 p-3" : "rounded-xl bg-teal-50/60 p-3"}>
                <p className="text-xs font-medium text-gray-700">
                  {m.author?.name ?? m.author?.email}
                  {m.parentId && <span className="text-gray-400"> · reply</span>}
                </p>
                <p className="mt-1 text-sm text-gray-800">{m.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
