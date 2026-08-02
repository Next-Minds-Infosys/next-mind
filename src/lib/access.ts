import { cache } from "react";
import { redirect } from "next/navigation";
import { Op } from "sequelize";
import { getSession } from "@/lib/auth";
import { Batch, BatchStudent, Policy, RolePolicy, User } from "@/db";
import { Role } from "@/lib/types";
import {
  adminLandingFor,
  canAccess,
  type Action,
  type PermissionMap,
  type Resource,
} from "@/lib/policies";

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

const getMustChangePassword = cache(async (userId: string) => {
  const user = await User.findByPk(userId, { attributes: ["mustChangePassword"] });
  return user?.mustChangePassword ?? false;
});

/**
 * Every portal entry point goes through here. An admin-issued password is known
 * to at least one other person, so the account is unusable until it is changed
 * - enforced server-side, not by hiding a link.
 */
export async function requirePasswordChanged(userId: string) {
  if (await getMustChangePassword(userId)) redirect("/account/change-password");
}

/** Union of every policy attached to the role. Cached per request (see src/db/queries.ts). */
export const getRolePermissions = cache(async (role: string): Promise<PermissionMap> => {
  const rows = await RolePolicy.findAll({
    where: { role },
    include: [{ model: Policy, as: "policy" }],
  });

  const merged: PermissionMap = {};
  for (const row of rows) {
    const permissions = row.policy?.permissions ?? {};
    for (const resource of Object.keys(permissions) as Resource[]) {
      const actions = permissions[resource] ?? [];
      merged[resource] = Array.from(new Set([...(merged[resource] ?? []), ...actions]));
    }
  }
  return merged;
});

type Session = Awaited<ReturnType<typeof getSession>>;

/** requireResource() for server actions - returns a checkable result instead of redirecting. */
export async function sessionCan(
  resource: Resource,
  action: Action = "read",
): Promise<{ session: NonNullable<Session>; allowed: boolean } | { session: null; allowed: false }> {
  const session = await getSession();
  if (!session) return { session: null, allowed: false };
  const permissions = await getRolePermissions(session.user.role);
  return { session, allowed: canAccess(permissions, resource, action) };
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

/** Per-resource gate inside /admin, layered under requireRole(ADMIN, EDITOR) in the layout. */
export async function requireResource(resource: Resource, action: Action = "read") {
  const session = await requireUser();
  await requirePasswordChanged(session.user.id);
  const permissions = await getRolePermissions(session.user.role);
  if (!canAccess(permissions, resource, action)) {
    redirect(adminLandingFor(permissions));
  }
  return session;
}

export function landingFor(role: Role) {
  // ADMIN and EDITOR both land in the admin shell; requireResource() then
  // sends EDITOR on to whatever their policy actually grants (e.g. /admin/blog).
  if (role === Role.ADMIN || role === Role.EDITOR) return "/admin";
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
