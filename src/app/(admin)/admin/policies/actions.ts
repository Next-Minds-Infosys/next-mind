"use server";

import { revalidatePath } from "next/cache";
import { Op } from "sequelize";
import { Policy, RolePolicy } from "@/db";
import { Role } from "@/lib/types";
import { parseInput, policySchema } from "@/lib/schemas";
import { RESOURCE_VALUES, RESOURCES, wouldLockOutAdmins, type PermissionMap } from "@/lib/policies";
import { sessionCan } from "@/lib/access";

type Result = { success: true } | { error: string };

/** Drops any resource key outside the known vocabulary and de-dupes actions. */
function sanitizePermissions(input: PermissionMap): PermissionMap {
  const out: PermissionMap = {};
  for (const resource of RESOURCE_VALUES) {
    const actions = input[resource];
    if (actions && actions.length > 0) out[resource] = Array.from(new Set(actions));
  }
  return out;
}

function mergeInto(target: PermissionMap, source: PermissionMap) {
  for (const resource of Object.keys(source) as (keyof PermissionMap)[]) {
    const actions = source[resource] ?? [];
    target[resource] = Array.from(new Set([...(target[resource] ?? []), ...actions]));
  }
}

/** ADMIN's merged permissions with excludePolicyId swapped for candidate (or just removed). */
async function candidateAdminPermissions(
  excludePolicyId: string,
  candidate?: { permissions: PermissionMap; attachedToAdmin: boolean },
): Promise<PermissionMap> {
  const rows = await RolePolicy.findAll({
    where: { role: Role.ADMIN, policyId: { [Op.ne]: excludePolicyId } },
    include: [{ model: Policy, as: "policy" }],
  });
  const merged: PermissionMap = {};
  for (const row of rows) mergeInto(merged, row.policy?.permissions ?? {});
  if (candidate?.attachedToAdmin) mergeInto(merged, candidate.permissions);
  return merged;
}

export async function createPolicy(data: unknown): Promise<Result> {
  const { allowed } = await sessionCan(RESOURCES.POLICIES, "create");
  if (!allowed) return { error: "Unauthorized" };

  const parsed = parseInput(policySchema, data);
  if (!parsed.success) return { error: parsed.error };
  const d = parsed.data;

  if (await Policy.findOne({ where: { name: d.name } })) {
    return { error: "A policy with that name already exists." };
  }

  const policy = await Policy.create({
    name: d.name,
    label: d.label,
    description: d.description || null,
    permissions: sanitizePermissions(d.permissions),
  });

  await RolePolicy.bulkCreate(d.roles.map((role) => ({ role, policyId: policy.id })));

  revalidatePath("/admin/policies");
  return { success: true };
}

export async function updatePolicy(id: string, data: unknown): Promise<Result> {
  const { allowed } = await sessionCan(RESOURCES.POLICIES, "update");
  if (!allowed) return { error: "Unauthorized" };

  const parsed = parseInput(policySchema, data);
  if (!parsed.success) return { error: parsed.error };
  const d = parsed.data;

  const policy = await Policy.findByPk(id);
  if (!policy) return { error: "Policy not found." };

  const clash = await Policy.findOne({ where: { name: d.name, id: { [Op.ne]: id } } });
  if (clash) return { error: "A policy with that name already exists." };

  const permissions = sanitizePermissions(d.permissions);

  // Preview the post-save state before writing anything - a mis-edit here
  // would lock every admin out of the one screen that could undo it.
  const candidate = await candidateAdminPermissions(id, {
    permissions,
    attachedToAdmin: d.roles.includes(Role.ADMIN),
  });
  if (wouldLockOutAdmins(candidate)) {
    return {
      error:
        "This would remove all admin access to Policies. Keep at least one policy granting ADMIN read access here.",
    };
  }

  await policy.update({
    name: d.name,
    label: d.label,
    description: d.description || null,
    permissions,
  });

  await RolePolicy.destroy({ where: { policyId: id } });
  await RolePolicy.bulkCreate(d.roles.map((role) => ({ role, policyId: id })));

  revalidatePath("/admin/policies");
  return { success: true };
}

export async function deletePolicy(id: string): Promise<Result> {
  const { allowed } = await sessionCan(RESOURCES.POLICIES, "delete");
  if (!allowed) return { error: "Unauthorized" };

  const policy = await Policy.findByPk(id);
  if (!policy) return { error: "Policy not found." };

  const candidate = await candidateAdminPermissions(id);
  if (wouldLockOutAdmins(candidate)) {
    return {
      error:
        "This would remove all admin access to Policies. Attach another policy with Policies access to ADMIN first.",
    };
  }

  await policy.destroy(); // RolePolicy rows cascade (onDelete: CASCADE).
  revalidatePath("/admin/policies");
  return { success: true };
}
