import { redirect } from "next/navigation";
import { Op } from "sequelize";
import { getSession } from "@/lib/auth";
import { Batch, BatchStudent, User } from "@/db";
import { Role } from "@/lib/types";

/**
 * Server-side authorisation.
 *
 * `proxy.ts` only checks that a session cookie exists - it cannot read roles
 * without a database round-trip on every request. So the cookie check is a
 * cheap redirect for anonymous users, and these helpers are the real gate.
 * Every instructor/student page and server action must call one of them.
 */

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/**
 * Every portal entry point goes through here. An admin-issued password is known
 * to at least one other person, so the account is unusable until it is changed
 * - enforced server-side, not by hiding a link.
 */
export async function requirePasswordChanged(userId: string) {
  const user = await User.findByPk(userId, { attributes: ["mustChangePassword"] });
  if (user?.mustChangePassword) redirect("/account/change-password");
}

export async function requireRole(...roles: Role[]) {
  const session = await requireUser();
  await requirePasswordChanged(session.user.id);
  if (!roles.includes(session.user.role as Role)) {
    // Deliberately not a 403 page: revealing that the route exists tells an
    // attacker what to aim at. Send them to their own landing instead.
    redirect(landingFor(session.user.role as Role));
  }
  return session;
}

export function landingFor(role: Role) {
  if (role === Role.ADMIN) return "/admin";
  if (role === Role.INSTRUCTOR) return "/instructor";
  return "/student";
}

/**
 * The core scoping rule. A batchId arriving from the client is untrusted - it
 * is a URL segment anyone can edit - so it is never used in a query until it
 * has been proven to belong to the caller.
 */
export async function assertInstructorOwnsBatch(batchId: string, userId: string) {
  const batch = await Batch.findOne({ where: { id: batchId, instructorId: userId } });
  if (!batch) redirect("/instructor");
  return batch;
}

export async function assertStudentInBatch(batchId: string, userId: string) {
  const membership = await BatchStudent.findOne({
    where: { batchId, userId, status: "ACTIVE" },
  });
  if (!membership) redirect("/student");
  return membership;
}

/** Batch ids the student may read. Use to scope list queries. */
export async function studentBatchIds(userId: string) {
  const rows = await BatchStudent.findAll({
    where: { userId, status: "ACTIVE" },
    attributes: ["batchId"],
  });
  return rows.map((r) => r.batchId);
}

/** Convenience for `where: { batchId: { [Op.in]: ids } }` with an empty-safe guard. */
export function inBatches(ids: string[]) {
  return { [Op.in]: ids.length > 0 ? ids : ["__none__"] };
}
