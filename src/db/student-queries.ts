import { Op } from "sequelize";
import {
  Assignment,
  Batch,
  BatchStudent,
  Course,
  Invoice,
  Lesson,
  LessonProgress,
  Submission,
  User,
} from "./index";

/**
 * Everything the student portal reads.
 *
 * Kept together so the scoping rule is enforced in one place: every query here
 * starts from the caller's own userId, or from the batch ids that userId is an
 * ACTIVE member of. A batchId from a URL never reaches a query untested - see
 * src/lib/access.ts.
 */

export async function myBatchIds(userId: string) {
  const rows = await BatchStudent.findAll({
    where: { userId, status: "ACTIVE" },
    attributes: ["batchId"],
  });
  return rows.map((r) => r.batchId);
}

/** Empty-safe IN clause: an empty array in Sequelize matches everything. */
const inList = (ids: string[]) => ({ [Op.in]: ids.length ? ids : ["__none__"] });

export interface BatchCard {
  batchId: string;
  name: string;
  code: string;
  courseTitle: string;
  status: string;
  schedule: string | null;
  instructor: string | null;
  totalLessons: number;
  doneLessons: number;
  percent: number;
}

export async function myBatchCards(userId: string): Promise<BatchCard[]> {
  const memberships = await BatchStudent.findAll({
    where: { userId, status: "ACTIVE" },
    include: [
      {
        model: Batch,
        as: "batch",
        include: [
          { model: Course, as: "course", attributes: ["title"] },
          { model: User, as: "instructor", attributes: ["name", "email"] },
        ],
      },
    ],
    order: [["enrolledAt", "DESC"]],
  });

  const batchIds = memberships.map((m) => m.batchId);

  // Only published lessons count - a draft is not something a student can do.
  const lessons = await Lesson.findAll({
    where: { batchId: inList(batchIds), published: true },
    attributes: ["id", "batchId"],
  });
  const done = await LessonProgress.findAll({
    where: { userId, lessonId: inList(lessons.map((l) => l.id)) },
    attributes: ["lessonId"],
  });
  const doneIds = new Set(done.map((d) => d.lessonId));

  return memberships.flatMap((m) => {
    const b = m.batch;
    if (!b) return [];
    const mine = lessons.filter((l) => l.batchId === m.batchId);
    const doneCount = mine.filter((l) => doneIds.has(l.id)).length;
    return [
      {
        batchId: m.batchId,
        name: b.name,
        code: b.code,
        courseTitle: b.course?.title ?? "—",
        status: b.status,
        schedule: b.schedule,
        instructor: b.instructor?.name ?? b.instructor?.email ?? null,
        totalLessons: mine.length,
        doneLessons: doneCount,
        percent: mine.length === 0 ? 0 : Math.round((doneCount / mine.length) * 100),
      },
    ];
  });
}

export interface DeadlineRow {
  assignmentId: string;
  batchId: string;
  batchName: string;
  title: string;
  dueAt: Date | null;
  maxScore: number;
  submittedAt: Date | null;
  score: number | null;
  feedback: string | null;
  gradedAt: Date | null;
}

/** Every published assignment in the student's batches, with their own submission. */
export async function myAssignments(userId: string): Promise<DeadlineRow[]> {
  const ids = await myBatchIds(userId);
  const [assignments, submissions] = await Promise.all([
    Assignment.findAll({
      where: { batchId: inList(ids), published: true },
      include: [{ model: Batch, as: "batch", attributes: ["name"] }],
      order: [["dueAt", "ASC"]],
    }),
    Submission.findAll({ where: { userId } }),
  ]);
  const mine = new Map(submissions.map((s) => [s.assignmentId, s]));

  return assignments.map((a) => {
    const s = mine.get(a.id);
    return {
      assignmentId: a.id,
      batchId: a.batchId,
      batchName: a.batch?.name ?? "—",
      title: a.title,
      dueAt: a.dueAt,
      maxScore: a.maxScore,
      submittedAt: s?.submittedAt ?? null,
      score: s?.score ?? null,
      feedback: s?.feedback ?? null,
      gradedAt: s?.gradedAt ?? null,
    };
  });
}

export async function myInvoices(userId: string) {
  const rows = await Invoice.findAll({
    where: { userId },
    include: [{ model: Batch, as: "batch", attributes: ["name", "code"] }],
    order: [["issuedAt", "DESC"]],
  });
  return rows.map((i) => ({
    id: i.id,
    invoiceNo: i.invoiceNo,
    description: i.description,
    batch: i.batch?.name ?? null,
    total: i.total,
    paidAmount: i.paidAmount,
    outstanding: i.total - i.paidAmount,
    status: i.status,
    issuedAt: i.issuedAt,
    dueAt: i.dueAt,
  }));
}

/** Headline numbers for the dashboard tiles. */
export async function myDashboardStats(userId: string) {
  const [cards, assignments, invoices] = await Promise.all([
    myBatchCards(userId),
    myAssignments(userId),
    myInvoices(userId),
  ]);

  const now = Date.now();
  const weekOut = now + 7 * 24 * 60 * 60 * 1000;

  const dueThisWeek = assignments.filter(
    (a) => !a.submittedAt && a.dueAt && a.dueAt.getTime() >= now && a.dueAt.getTime() <= weekOut,
  );
  const overdue = assignments.filter(
    (a) => !a.submittedAt && a.dueAt && a.dueAt.getTime() < now,
  );
  const awaitingGrade = assignments.filter((a) => a.submittedAt && a.gradedAt === null);
  const graded = assignments.filter((a) => a.gradedAt !== null && a.score !== null);

  const outstanding = invoices
    .filter((i) => i.status !== "CANCELLED")
    .reduce((n, i) => n + i.outstanding, 0);

  const totalLessons = cards.reduce((n, c) => n + c.totalLessons, 0);
  const doneLessons = cards.reduce((n, c) => n + c.doneLessons, 0);

  const scored = graded.reduce((n, a) => n + (a.score ?? 0), 0);
  const scoreMax = graded.reduce((n, a) => n + a.maxScore, 0);

  return {
    cards,
    assignments,
    invoices,
    batches: cards.length,
    dueThisWeek: dueThisWeek.length,
    overdue: overdue.length,
    awaitingGrade: awaitingGrade.length,
    outstanding,
    overallPercent: totalLessons === 0 ? 0 : Math.round((doneLessons / totalLessons) * 100),
    averageScore: scoreMax === 0 ? null : Math.round((scored / scoreMax) * 100),
    upcoming: assignments
      .filter((a) => !a.submittedAt && a.dueAt)
      .sort((a, b) => (a.dueAt!.getTime() - b.dueAt!.getTime()))
      .slice(0, 6),
  };
}
