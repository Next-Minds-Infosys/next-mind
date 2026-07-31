import Link from "next/link";
import { Assignment, Batch, Course, Lesson, LessonProgress, Material, Message, Submission, User } from "@/db";
import { requireRole, assertStudentInBatch } from "@/lib/access";
import { Role } from "@/lib/types";
import { VideoPlayer } from "@/components/lms/video-player";
import { Reply, SubmitAssignment } from "./interactions";
import { LessonComplete } from "@/components/lms/lesson-complete";
import { Progress } from "@/components/lms/ui";

const panel = "rounded-2xl bg-white p-6 ring-1 ring-gray-950/5";

export default async function StudentBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole(Role.STUDENT, Role.ADMIN);
  // Redirects unless the student holds an ACTIVE membership for this batch.
  await assertStudentInBatch(id, session.user.id);

  const batch = await Batch.findByPk(id, {
    include: [{ model: Course, as: "course", attributes: ["title"] }],
  });
  if (!batch) return null;

  const [lessons, materials, assignments, mySubmissions, progress, messages] = await Promise.all([
    Lesson.findAll({
      where: { batchId: id, published: true },
      order: [["orderIndex", "ASC"], ["createdAt", "ASC"]],
    }),
    Material.findAll({ where: { batchId: id }, order: [["createdAt", "DESC"]] }),
    Assignment.findAll({
      where: { batchId: id, published: true },
      order: [["dueAt", "ASC"]],
    }),
    Submission.findAll({ where: { userId: session.user.id } }),
    LessonProgress.findAll({ where: { userId: session.user.id }, attributes: ["lessonId"] }),
    Message.findAll({
      where: { batchId: id },
      order: [["createdAt", "ASC"]],
      include: [{ model: User, as: "author", attributes: ["name", "email"] }],
    }),
  ]);

  const doneIds = new Set(progress.map((p) => p.lessonId));
  const donePercent =
    lessons.length === 0
      ? 0
      : Math.round((lessons.filter((l) => doneIds.has(l.id)).length / lessons.length) * 100);

  const submissionFor = (assignmentId: string) =>
    mySubmissions.find((s) => s.assignmentId === assignmentId);
  // react-hooks/purity guards against a value changing between re-renders of a
  // client component. This is an async Server Component: it runs once per
  // request and never re-renders, so a single clock read is exactly right.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const watermark = `${session.user.name ?? session.user.email} · ${session.user.id.slice(0, 8)}`;
  const threads = messages.filter((m) => !m.parentId);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <header>
        <Link href="/student" className="text-sm text-teal-600 hover:text-teal-700">
          ← My batches
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">{batch.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {batch.course?.title} · {batch.schedule ?? batch.mode}
        </p>
      </header>

      <section className={panel}>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="font-semibold text-gray-900">Recorded lessons</h2>
          <span className="text-sm tabular-nums text-gray-500">
            {lessons.filter((l) => doneIds.has(l.id)).length}/{lessons.length} · {donePercent}%
          </span>
        </div>
        {lessons.length > 0 && (
          <div className="mb-5">
            <Progress percent={donePercent} />
          </div>
        )}
        {lessons.length === 0 ? (
          <p className="text-sm text-gray-500">No recordings yet.</p>
        ) : (
          <div className="space-y-6">
            {lessons.map((l) => (
              <article key={l.id}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-medium text-gray-900">{l.title}</h3>
                  <LessonComplete lessonId={l.id} done={doneIds.has(l.id)} />
                </div>
                {l.description && <p className="mb-2 text-sm text-gray-600">{l.description}</p>}
                {l.videoKey ? (
                  <VideoPlayer src={`/api/media/${l.videoKey}`} watermark={watermark} />
                ) : (
                  <p className="text-sm text-gray-500">Video not uploaded yet.</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={panel}>
        <h2 className="mb-4 font-semibold text-gray-900">Files</h2>
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
                {m.downloadable ? (
                  <a
                    href={`/api/media/${m.storageKey}`}
                    className="text-sm font-medium text-teal-600 hover:text-teal-700"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">View only</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={panel}>
        <h2 className="mb-4 font-semibold text-gray-900">Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing set yet.</p>
        ) : (
          <div className="space-y-6">
            {assignments.map((a) => {
              const mine = submissionFor(a.id);
              const overdue = a.dueAt ? a.dueAt.getTime() < now : false;
              return (
                <div key={a.id} className="rounded-xl bg-gray-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{a.title}</p>
                      <p className="text-xs text-gray-500">
                        {a.dueAt ? `Due ${a.dueAt.toLocaleString()}` : "No due date"} · max{" "}
                        {a.maxScore}
                        {overdue && !mine && <span className="text-red-600"> · closed</span>}
                      </p>
                    </div>
                    {a.attachmentKey && (
                      <a
                        href={`/api/media/${a.attachmentKey}`}
                        className="text-sm font-medium text-teal-600 hover:text-teal-700"
                      >
                        Download brief
                      </a>
                    )}
                  </div>

                  {a.briefMd && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{a.briefMd}</p>
                  )}

                  {mine && (
                    <div className="mt-3 rounded-lg bg-white p-3 ring-1 ring-gray-950/5">
                      <p className="text-xs text-gray-500">
                        Submitted {mine.submittedAt.toLocaleString()}
                        {mine.fileName && ` · ${mine.fileName}`}
                      </p>
                      {mine.gradedAt && (
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          Score: {mine.score}/{a.maxScore}
                          {mine.feedback && (
                            <span className="block font-normal text-gray-600">{mine.feedback}</span>
                          )}
                        </p>
                      )}
                    </div>
                  )}

                  {!overdue && (
                    <SubmitAssignment
                      batchId={id}
                      assignmentId={a.id}
                      locked={Boolean(mine?.gradedAt)}
                      hasSubmitted={Boolean(mine)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className={panel}>
        <h2 className="mb-4 font-semibold text-gray-900">Messages</h2>
        {threads.length === 0 ? (
          <p className="text-sm text-gray-500">No announcements yet.</p>
        ) : (
          <ul className="space-y-4">
            {threads.map((t) => (
              <li key={t.id} className="rounded-xl bg-teal-50/60 p-3">
                <p className="text-xs font-medium text-gray-700">
                  {t.author?.name ?? t.author?.email}
                </p>
                <p className="mt-1 text-sm text-gray-800">{t.body}</p>

                <ul className="mt-2 space-y-2">
                  {messages
                    .filter((m) => m.parentId === t.id)
                    .map((r) => (
                      <li key={r.id} className="ml-4 rounded-lg bg-white p-2 ring-1 ring-gray-950/5">
                        <p className="text-xs font-medium text-gray-700">
                          {r.author?.name ?? r.author?.email}
                        </p>
                        <p className="text-sm text-gray-800">{r.body}</p>
                      </li>
                    ))}
                </ul>

                <Reply batchId={id} parentId={t.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
