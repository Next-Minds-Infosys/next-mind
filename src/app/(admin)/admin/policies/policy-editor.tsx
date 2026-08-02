"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { policySchema, type PolicyFormValues, type PolicyInput } from "@/lib/schemas";
import {
  ACTIONS,
  RESOURCE_VALUES,
  RESOURCES,
  type Action,
  type PermissionMap,
  type Resource,
} from "@/lib/policies";
import { createPolicy, updatePolicy } from "./actions";

const RESOURCE_LABELS: Record<Resource, string> = {
  [RESOURCES.DASHBOARD]: "Dashboard",
  [RESOURCES.CATEGORIES]: "Categories",
  [RESOURCES.COURSES]: "Courses",
  [RESOURCES.BATCHES]: "Batches",
  [RESOURCES.MENTORS]: "Mentors",
  [RESOURCES.USERS]: "Users",
  [RESOURCES.BILLING]: "Billing",
  [RESOURCES.EXPENSES]: "Expenses",
  [RESOURCES.BLOG]: "Blog",
  [RESOURCES.ENROLLMENTS]: "Enrollments",
  [RESOURCES.CONTACTS]: "Contacts",
  [RESOURCES.ENTERPRISE_INQUIRIES]: "Enterprise Inquiries",
  [RESOURCES.POLICIES]: "Policies",
};

// Only these two roles reach /admin at all - see src/app/(admin)/admin/layout.tsx.
// Instructor/Student use separate portals that don't consult this system, so
// they're deliberately not offered here even though RolePolicy.role is plain text.
const ROLE_OPTIONS = ["ADMIN", "EDITOR"] as const;

const input =
  "w-full rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500";
const label = "text-sm font-medium text-gray-700";
const box = "space-y-3 rounded-2xl bg-white p-5 ring-1 ring-gray-950/5";

export function PolicyEditor({ initial }: { initial?: PolicyInput & { id: string } }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [permissions, setPermissions] = useState<PermissionMap>(initial?.permissions ?? {});
  const [roles, setRoles] = useState<string[]>(initial?.roles ?? []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PolicyFormValues, unknown, PolicyInput>({
    resolver: zodResolver(policySchema),
    defaultValues: initial ?? { name: "", label: "", description: "", permissions: {}, roles: [] },
  });

  const err = (n: "name" | "label" | "description") =>
    errors[n] && <p className="mt-1 text-xs text-red-600">{errors[n]?.message}</p>;

  function toggleAction(resource: Resource, action: Action) {
    setPermissions((prev) => {
      const current = prev[resource] ?? [];
      const next = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [resource]: next };
    });
  }

  function toggleRole(role: string) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  async function onSubmit(values: PolicyInput) {
    if (roles.length === 0) {
      setServerError("Select at least one role.");
      return;
    }
    setServerError("");
    const payload: PolicyInput = {
      ...values,
      permissions,
      roles: roles as PolicyInput["roles"],
    };
    const r = initial ? await updatePolicy(initial.id, payload) : await createPolicy(payload);
    if ("error" in r) return setServerError(r.error);
    router.push("/admin/policies");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/policies"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Back to policies"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">
          {initial ? "Edit policy" : "New policy"}
        </h1>
      </div>

      <div className={box}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className={label}>Name (slug)</label>
            <input {...register("name")} placeholder="content-and-leads" className={input} />
            {err("name")}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className={label}>Label</label>
            <input {...register("label")} placeholder="Content & Leads" className={input} />
            {err("label")}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={label}>Description</label>
          <textarea rows={2} {...register("description")} className={input} />
        </div>
      </div>

      <div className={box}>
        <h2 className="font-semibold text-gray-900">Attach to roles</h2>
        <p className="text-xs text-gray-500">
          Only Admin and Editor read the admin panel through this system — Instructor and
          Student use their own portals and are not affected by policies here.
        </p>
        <div className="flex gap-4 pt-1">
          {ROLE_OPTIONS.map((role) => (
            <label key={role} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={roles.includes(role)}
                onChange={() => toggleRole(role)}
                className="accent-teal-600"
              />
              {role}
            </label>
          ))}
        </div>
      </div>

      <div className={`${box} overflow-x-auto`}>
        <h2 className="font-semibold text-gray-900">Permissions</h2>
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              <th className="py-2 pr-4">Resource</th>
              {ACTIONS.map((action) => (
                <th key={action} className="px-3 py-2 text-center capitalize">
                  {action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RESOURCE_VALUES.map((resource) => (
              <tr key={resource} className="border-t border-gray-950/5">
                <td className="py-2 pr-4 font-medium text-gray-700">
                  {RESOURCE_LABELS[resource]}
                </td>
                {ACTIONS.map((action) => (
                  <td key={action} className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      aria-label={`${RESOURCE_LABELS[resource]} - ${action}`}
                      checked={(permissions[resource] ?? []).includes(action)}
                      onChange={() => toggleAction(resource, action)}
                      className="accent-teal-600"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? "Saving…" : initial ? "Save changes" : "Create policy"}
      </button>
    </form>
  );
}
