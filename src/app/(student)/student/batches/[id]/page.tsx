import Link from "next/link";
import { Assignment, Batch, Course, Lesson, LessonProgress, Material, Message, Submission, User } from "@/db";
import { requireRole, assertStudentInBatch } from "@/lib/access";
import { Role } from "@/lib/types";
import { Reply, SubmitAssignment } from "./interactions";
import { LessonList } from "@/components/lms/lesson-list";
import {
  Avatar,
  Chip,
  EmptyState,
  Panel,
  PanelTitle,
  Progress,
  StatCard,
  relativeTime,
} from "@/components/lms/ui";
import { BatchTabs } from "@/components/lms/batch-tabs";
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
  const doneCount = lessons.filter((l) => doneIds.has(l.id)).length;
  const donePercent = lessons.length === 0 ? 0 : Math.round((doneCount / lessons.length) * 100);

  const submissionFor = (assignmentId: string) =>
    mySubmissions.find((s) => s.assignmentId === assignmentId);
  // react-hooks/purity guards against a value changing between re-renders of a
  // client component. This is an async Server Component: it runs once per
  // request and never re-renders, so a single clock read is exactly right.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const watermark = `${session.user.name ?? session.user.email} · ${session.user.id.slice(0, 8)}`;
  const threads = messages.filter((m) => !m.parentId);

  // Published work with nothing handed in yet - the number the student acts on.
  const openAssignments = assignments.filter((a) => !submissionFor(a.id)).length;

  // Averaged over graded work only. An em dash until something is graded, so an
  // ungraded batch never reads as a score of zero.
  const gradedSubs = mySubmissions.filter((s) => s.gradedAt && s.score != null);
  const averageGrade =
    gradedSubs.length === 0
      ? "—"
      : `${Math.round(gradedSubs.reduce((n, s) => n + (s.score ?? 0), 0) / gradedSubs.length)}`;

  const lessonsPanel = (
    <Panel>
      <PanelTitle>Recorded lessons</PanelTitle>
      <div className="p-6">
        {lessons.length === 0 ? (
          <EmptyState
            icon={PlayCircle}
            title="No recordings yet"
            hint="Lesson recordings appear here once your instructor publishes them."
          />
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between gap-4">
              <Progress percent={donePercent} />
              <span className="flex-shrink-0 text-xs tabular-nums text-nm-muted">
                {doneCount}/{lessons.length}
              </span>
            </div>
            <LessonList
              watermark={watermark}
              lessons={lessons.map((l) => ({
                id: l.id,
                title: l.title,
                description: l.description,
                videoKey: l.videoKey,
                done: doneIds.has(l.id),
              }))}
            />
          </>
        )}
      </div>
    </Panel>
  );

  const filesPanel = (
    <Panel>
      <PanelTitle>Shared files</PanelTitle>
      <div className="p-6">
        {materials.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No files yet"
            hint="Slides, notes and other course material your instructor shares will show up here."
          />
        ) : (
          <ul className="divide-y divide-nm-border">
            {materials.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="font-medium text-nm-navy">{m.title}</p>
                  <p className="text-xs text-nm-muted">{m.fileName}</p>
                </div>
                {m.downloadable ? (
                  <a
                    href={`/api/media/${m.storageKey}`}
                    className="flex-shrink-0 rounded-lg border border-nm-border px-3 py-1.5 text-sm font-semibold text-nm-navy transition-colors hover:bg-nm-surface"
                  >
                    Download
                  </a>
                ) : (
                  <span className="flex-shrink-0 text-xs text-nm-muted">View only</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );

  const assignmentsPanel = (
    <Panel>
      <PanelTitle>Assignments</PanelTitle>
      <div className="p-6">
        {assignments.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title="No assignments yet"
            hint="Work set by your instructor appears here, with its due date and a place to upload your submission."
          />
        ) : (
          <div className="space-y-4">
            {assignments.map((a) => {
              const mine = submissionFor(a.id);
              const overdue = a.dueAt ? a.dueAt.getTime() < now : false;
              const status = mine?.gradedAt
                ? { label: `Graded · ${mine.score}/${a.maxScore}`, cls: "bg-teal-50 text-teal-700" }
                : mine
                  ? { label: "Submitted · awaiting grade", cls: "bg-amber-50 text-amber-700" }
                  : overdue
                    ? { label: "Closed", cls: "bg-red-50 text-red-700" }
                    : { label: "Not submitted", cls: "bg-nm-surface text-nm-muted" };
              return (
                <div key={a.id} className="rounded-xl border border-nm-border">
                  <div className="border-b border-nm-border px-5 py-3">
                    <h3 className="font-semibold text-nm-navy">{a.title}</h3>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <p className="text-sm text-nm-muted">
                      {a.dueAt ? `Due ${a.dueAt.toLocaleString()}` : "No due date"} · {a.maxScore} points
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      {a.attachmentKey && (
                        <a
                          href={`/api/media/${a.attachmentKey}`}
                          className="text-sm font-semibold text-teal-700 hover:text-teal-800"
                        >
                          Download brief
                        </a>
                      )}
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {a.briefMd && (
                    <p className="whitespace-pre-wrap border-t border-nm-border px-5 py-4 text-sm text-nm-body">
                      {a.briefMd}
                    </p>
                  )}

                  {mine && (
                    <p className="border-t border-nm-border px-5 py-3 text-xs text-nm-muted">
                      Submitted {mine.submittedAt.toLocaleString()}
                      {mine.fileName && ` · ${mine.fileName}`}
                      {mine.feedback && (
                        <span className="mt-1 block text-sm text-nm-body">{mine.feedback}</span>
                      )}
                    </p>
                  )}

                  {!overdue && (
                    <div className="border-t border-nm-border px-5 py-4">
                      <SubmitAssignment
                        batchId={id}
                        assignmentId={a.id}
                        locked={Boolean(mine?.gradedAt)}
                        hasSubmitted={Boolean(mine)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Panel>
  );

  const messagesPanel = (
    <Panel>
      <PanelTitle>Messages</PanelTitle>
      <div className="p-6">
        {threads.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No announcements yet"
            hint="Announcements from your instructor show up here, and you can reply to any of them."
          />
        ) : (
          <ul className="space-y-5">
            {threads.map((t) => {
              const name = t.author?.name ?? t.author?.email ?? "Unknown";
              return (
                <li key={t.id} className="rounded-xl border border-nm-border p-4">
                  <div className="flex gap-3">
                    <Avatar name={name} />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm font-semibold text-nm-navy">{name}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-nm-muted">
                          Instructor
                        </span>
                        <span className="text-xs text-nm-muted">{relativeTime(t.createdAt)}</span>
                      </p>
                      <p className="mt-1 text-sm text-nm-body">{t.body}</p>
                    </div>
                  </div>

                  {messages.filter((m) => m.parentId === t.id).length > 0 && (
                    <ul className="mt-4 space-y-3 border-l-2 border-nm-border pl-4">
                      {messages
                        .filter((m) => m.parentId === t.id)
                        .map((r) => {
                          const rName = r.author?.name ?? r.author?.email ?? "Unknown";
                          return (
                            <li key={r.id} className="flex gap-3">
                              <Avatar name={rName} tone="light" />
                              <div className="min-w-0 flex-1">
                                <p className="flex flex-wrap items-baseline gap-2">
                                  <span className="text-sm font-semibold text-nm-navy">{rName}</span>
                                  <span className="text-xs text-nm-muted">
                                    {relativeTime(r.createdAt)}
                                  </span>
                                </p>
                                <p className="mt-0.5 text-sm text-nm-body">{r.body}</p>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  )}

                  <div className="mt-3">
                    <Reply batchId={id} parentId={t.id} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Panel>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <Link
          href="/student"
          className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
        >
          ‹ My batches
        </Link>
        <h1 className="mt-3 font-display text-3xl font-bold text-nm-navy">{batch.name}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {batch.code && <Chip>CODE · {batch.code}</Chip>}
          {batch.course?.title && <Chip tone="teal">{batch.course.title}</Chip>}
          {(batch.schedule ?? batch.mode) && <Chip>{batch.schedule ?? batch.mode}</Chip>}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard value={`${doneCount} / ${lessons.length}`} label="Lessons watched" />
        <StatCard value={materials.length} label="Files available" />
        <StatCard
          value={openAssignments}
          label="Assignments due"
          attention={openAssignments > 0}
        />
        <StatCard value={averageGrade} label="Average grade" />
      </div>

      <BatchTabs
        tabs={[
          { id: "lessons", label: "Lessons", content: lessonsPanel },
          { id: "files", label: "Files", content: filesPanel },
          { id: "assignments", label: "Assignments", content: assignmentsPanel },
          { id: "messages", label: "Messages", content: messagesPanel },
        ]}
      />
    </div>
  );
}
