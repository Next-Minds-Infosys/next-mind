import Link from "next/link";
import { Assignment, Batch, Course, Lesson, LessonProgress, Material, Message, Submission, User } from "@/db";
import { requireRole, assertStudentInBatch } from "@/lib/access";
import { Role } from "@/lib/types";
import { VideoPlayer } from "@/components/lms/video-player";
import { Reply, SubmitAssignment } from "./interactions";
import { LessonComplete } from "@/components/lms/lesson-complete";
import {
  BatchHeader,
  EmptyState,
  Progress,
  SectionCard,
  SummaryStrip,
} from "@/components/lms/ui";
import { FileText, MessageSquare, NotebookPen, PlayCircle } from "lucide-react";

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
  // Anything published and not yet submitted still needs the student's attention.
  const openAssignments = assignments.filter((a) => !submissionFor(a.id)).length;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <BatchHeader
        backHref="/student"
        backLabel="My batches"
        title={batch.name}
        meta={[batch.course?.title, batch.schedule ?? batch.mode]}
      />

      {/* What needs attention, before the content itself. */}
      <SummaryStrip
        items={[
          { label: "Course progress", value: `${donePercent}%`, tone: donePercent > 0 ? "good" : "default" },
          { label: "Lessons", value: `${lessons.filter((l) => doneIds.has(l.id)).length}/${lessons.length}` },
          { label: "Assignments due", value: openAssignments, tone: openAssignments > 0 ? "warn" : "default" },
          { label: "Files shared", value: materials.length },
        ]}
      />

      <SectionCard
        icon={PlayCircle}
        title="Recorded lessons"
        count={lessons.length}
        aside={
          lessons.length > 0 ? (
            <span className="text-sm tabular-nums text-nm-muted">
              {lessons.filter((l) => doneIds.has(l.id)).length}/{lessons.length} · {donePercent}%
            </span>
          ) : null
        }
      >
        {lessons.length > 0 && (
          <div className="mb-5">
            <Progress percent={donePercent} />
          </div>
        )}
        {lessons.length === 0 ? (
          <EmptyState
            icon={PlayCircle}
            title="No recordings yet"
            hint="Lesson recordings appear here once your instructor publishes them."
          />
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
      </SectionCard>

      <SectionCard icon={FileText} title="Files" count={materials.length}>
        {materials.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No files yet"
            hint="Slides, notes and other course material your instructor shares will show up here."
          />
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
      </SectionCard>

      <SectionCard
        icon={NotebookPen}
        title="Assignments"
        count={assignments.length}
        aside={
          openAssignments > 0 ? (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              {openAssignments} to submit
            </span>
          ) : null
        }
      >
        {assignments.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title="No assignments yet"
            hint="Work set by your instructor appears here, with its due date and a place to upload your submission."
          />
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
      </SectionCard>

      <SectionCard icon={MessageSquare} title="Messages" count={threads.length}>
        {threads.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No announcements yet"
            hint="Announcements from your instructor show up here, and you can reply to any of them."
          />
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
      </SectionCard>
    </div>
  );
}
