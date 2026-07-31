import { Op } from "sequelize";
import { Assignment, Batch, BatchStudent, Course, Submission, User } from "./index";

/**
 * Instructor portal reads. Every query is scoped to batches this user owns -
 * an admin sees all, which matches requireRole(INSTRUCTOR, ADMIN) on the layout.
 */

const inList = (ids: string[]) => ({ [Op.in]: ids.length ? ids : ["__none__"] });

export async function myTaughtBatches(userId: string, isAdmin: boolean) {
  return Batch.findAll({
    where: isAdmin ? {} : { instructorId: userId },
    include: [{ model: Course, as: "course", attributes: ["title"] }],
    order: [["createdAt", "DESC"]],
  });
}

export interface TaughtBatchCard {
  id: string;
  name: string;
  code: string;
  courseTitle: string;
  mode: string;
  status: string;
  students: number;
  assignments: number;
  ungraded: number;
}

export async function myBatchOverview(
  userId: string,
  isAdmin: boolean,
): Promise<TaughtBatchCard[]> {
  const batches = await myTaughtBatches(userId, isAdmin);
  const ids = batches.map((b) => b.id);

  const [members, assignments] = await Promise.all([
    BatchStudent.findAll({ where: { batchId: inList(ids), status: "ACTIVE" }, attributes: ["batchId"] }),
    Assignment.findAll({ where: { batchId: inList(ids) }, attributes: ["id", "batchId"] }),
  ]);

  const ungradedRows = await Submission.findAll({
    where: { assignmentId: inList(assignments.map((a) => a.id)), gradedAt: null },
    attributes: ["assignmentId"],
  });
  const batchOfAssignment = new Map(assignments.map((a) => [a.id, a.batchId]));

  return batches.map((b) => ({
    id: b.id,
    name: b.name,
    code: b.code,
    courseTitle: b.course?.title ?? "—",
    mode: b.mode,
    status: b.status,
    students: members.filter((m) => m.batchId === b.id).length,
    assignments: assignments.filter((a) => a.batchId === b.id).length,
    ungraded: ungradedRows.filter((s) => batchOfAssignment.get(s.assignmentId) === b.id).length,
  }));
}

export interface GradingRow {
  submissionId: string;
  batchId: string;
  batchName: string;
  assignmentTitle: string;
  maxScore: number;
  studentName: string;
  studentEmail: string;
  submittedAt: Date;
  storageKey: string | null;
  fileName: string | null;
  note: string | null;
}

/** Everything awaiting a mark, across every batch this instructor owns. */
export async function myGradingQueue(userId: string, isAdmin: boolean): Promise<GradingRow[]> {
  const batches = await myTaughtBatches(userId, isAdmin);
  const ids = batches.map((b) => b.id);
  const nameOf = new Map(batches.map((b) => [b.id, b.name]));

  const assignments = await Assignment.findAll({
    where: { batchId: inList(ids) },
    attributes: ["id", "batchId", "title", "maxScore"],
  });
  const meta = new Map(assignments.map((a) => [a.id, a]));

  const rows = await Submission.findAll({
    where: { assignmentId: inList(assignments.map((a) => a.id)), gradedAt: null },
    include: [{ model: User, as: "user", attributes: ["name", "email"] }],
    order: [["submittedAt", "ASC"]],
  });

  return rows.flatMap((s) => {
    const a = meta.get(s.assignmentId);
    if (!a) return [];
    return [
      {
        submissionId: s.id,
        batchId: a.batchId,
        batchName: nameOf.get(a.batchId) ?? "—",
        assignmentTitle: a.title,
        maxScore: a.maxScore,
        studentName: s.user?.name ?? "—",
        studentEmail: s.user?.email ?? "",
        submittedAt: s.submittedAt,
        storageKey: s.storageKey,
        fileName: s.fileName,
        note: s.note,
      },
    ];
  });
}
