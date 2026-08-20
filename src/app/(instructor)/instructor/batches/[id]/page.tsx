import Link from "next/link";
import { Assignment, BatchStudent, Course, Lesson, Material, Message, Submission, User } from "@/db";
import { requireRole, assertInstructorOwnsBatch } from "@/lib/access";
import { Role } from "@/lib/types";
import { AddAssignment, AddLesson, AddMaterial, Announce, GradeForm } from "./workspace";
import {
  Avatar,
  Chip,
  EmptyState,
  Panel,
  PanelTitle,
  StatCard,
  relativeTime,
} from "@/components/lms/ui";
import { BatchTabs } from "@/components/lms/batch-tabs";
import { FileText, MessageSquare, NotebookPen, PlayCircle } from "lucide-react";

/**
 * Everything under here reads the session and queries Postgres per request, so
 * none of it can be prerendered.
 */
export const dynamic = "force-dynamic";

// Belt and braces with robots.txt: nothing behind a login should be indexed.
export const metadata = { robots: { index: false, follow: false } };

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

  // Submissions handed in but not yet scored - the number to act on.
  const ungraded = assignments.reduce(
    (n, a) => n + (a.submissions ?? []).filter((s) => s.gradedAt == null).length,
    0,
  );

  const lessonsPanel = (
    <div className="space-y-6">
      <AddLesson batchId={id} />
      <Panel>
        <PanelTitle>Published lessons</PanelTitle>
        <div className="p-6">
          {lessons.length === 0 ? (
            <EmptyState
              icon={PlayCircle}
              title="No lessons yet"
              hint="Use the form above. Students see each lesson as soon as you publish it."
            />
          ) : (
            <ul className="divide-y divide-nm-border">
              {lessons.map((l) => (
                <li key={l.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <PlayCircle size={17} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-nm-navy">{l.title}</p>
                    {l.description && (
                      <p className="mt-0.5 text-sm text-nm-muted">{l.description}</p>
                    )}
                    <p className="mt-1 text-xs text-nm-muted">
                      {l.videoKey ? "Video attached" : "No video"} · {relativeTime(l.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      l.published ? "bg-teal-50 text-teal-700" : "bg-nm-surface text-nm-muted"
                    }`}
                  >
                    {l.published ? "Published" : "Draft"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>
    </div>
  );

  const filesPanel = (
    <div className="space-y-6">
      <AddMaterial batchId={id} />
      <Panel>
        <PanelTitle>Shared files</PanelTitle>
        <div className="p-6">
          {materials.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No files shared"
              hint="Share slides, notes or reference material using the form above."
            />
          ) : (
            <ul className="divide-y divide-nm-border">
              {materials.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-medium text-nm-navy">{m.title}</p>
                    <p className="text-xs text-nm-muted">{m.fileName}</p>
                  </div>
                  <a
                    href={`/api/media/${m.storageKey}`}
                    className="flex-shrink-0 rounded-lg border border-nm-border px-3 py-1.5 text-sm font-semibold text-nm-navy transition-colors hover:bg-nm-surface"
                  >
                    Open
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Panel>
    </div>
  );

  const assignmentsPanel = (
    <div className="space-y-6">
      <AddAssignment batchId={id} />
      <Panel>
        <PanelTitle>Assignments &amp; submissions</PanelTitle>
        <div className="p-6">
          {assignments.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title="No assignments yet"
              hint="Set work using the form above. Submissions appear here ready for grading."
            />
          ) : (
            <div className="space-y-4">
              {assignments.map((a) => {
                const subs = a.submissions ?? [];
                const pending = subs.filter((s) => s.gradedAt == null).length;
                return (
                  <div key={a.id} className="rounded-xl border border-nm-border">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-nm-border px-5 py-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-nm-navy">{a.title}</h3>
                        <p className="text-xs text-nm-muted">
                          {a.dueAt ? `Due ${a.dueAt.toLocaleString()}` : "No due date"} ·{" "}
                          {a.maxScore} points · {subs.length}/{roster.length} submitted
                        </p>
                      </div>
                      {pending > 0 && (
                        <span className="flex-shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          {pending} to grade
                        </span>
                      )}
                    </div>
                    {subs.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-nm-muted">No submissions yet.</p>
                    ) : (
                      <ul className="divide-y divide-nm-border">
                        {subs.map((s) => (
                          <li key={s.id} className="px-5 py-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-nm-navy">
                                {s.user?.name ?? s.user?.email}
                              </span>
                              {s.storageKey && (
                                <a
                                  href={`/api/media/${s.storageKey}`}
                                  className="text-sm font-semibold text-teal-700 hover:text-teal-800"
                                >
                                  Download {s.fileName}
                                </a>
                              )}
                            </div>
                            {s.note && <p className="mt-1 text-xs text-nm-muted">{s.note}</p>}
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
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );

  const messagesPanel = (
    <div className="space-y-6">
      <Announce batchId={id} />
      <Panel>
        <PanelTitle>Messages</PanelTitle>
        <div className="p-6">
          {messages.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Nothing posted yet"
              hint="Announcements you post reach everyone in the batch, and students can reply."
            />
          ) : (
            <ul className="space-y-4">
              {messages.map((m) => {
                const name = m.author?.name ?? m.author?.email ?? "Unknown";
                return (
                  <li key={m.id} className={m.parentId ? "ml-8 flex gap-3" : "flex gap-3"}>
                    <Avatar name={name} tone={m.parentId ? "light" : "dark"} />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm font-semibold text-nm-navy">{name}</span>
                        {m.parentId && (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-nm-muted">
                            Reply
                          </span>
                        )}
                        <span className="text-xs text-nm-muted">{relativeTime(m.createdAt)}</span>
                      </p>
                      <p className="mt-0.5 text-sm text-nm-body">{m.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Panel>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <Link
          href="/instructor"
          className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
        >
          ‹ My batches
        </Link>
        <h1 className="mt-3 font-display text-3xl font-bold text-nm-navy">{batch.name}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {batch.code && <Chip>CODE · {batch.code}</Chip>}
          {course?.title && <Chip tone="teal">{course.title}</Chip>}
          <Chip>
            {roster.length} {roster.length === 1 ? "student" : "students"}
            {batch.mode ? ` · ${batch.mode}` : ""}
          </Chip>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard value={roster.length} label="Students" />
        <StatCard value={lessons.length} label="Lessons" />
        <StatCard value={materials.length} label="Files" />
        <StatCard value={ungraded} label="Awaiting grading" attention={ungraded > 0} />
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
