import Link from "next/link";
import { Plus } from "lucide-react";
import { Policy, RolePolicy } from "@/db";
import { requireResource } from "@/lib/access";
import { RESOURCES, type Resource } from "@/lib/policies";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { PolicyRowActions } from "./policy-actions";

export default async function AdminPoliciesPage() {
  await requireResource(RESOURCES.POLICIES);

  const policies = await Policy.findAll({
    order: [["createdAt", "ASC"]],
    include: [{ model: RolePolicy, as: "roleAttachments" }],
  });

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Policies</h1>
          <p className="mt-1 text-sm text-gray-500">
            What each role can see and do in the admin panel. Attach a policy to a role to
            grant it — Admin and Editor are the only roles that read this.
          </p>
        </div>
        <Link
          href="/admin/policies/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg"
        >
          <Plus size={16} />
          New policy
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Policy</TableHead>
            <TableHead>Resources</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((p) => {
            const resources = Object.keys(p.permissions ?? {}) as Resource[];
            const roles = (p.roleAttachments ?? []).map((r) => r.role);
            return (
              <TableRow key={p.id}>
                <TableCell>
                  <p className="font-medium text-gray-900">{p.label}</p>
                  <p className="text-xs text-gray-400">{p.name}</p>
                  {p.description && (
                    <p className="mt-1 max-w-sm text-xs text-gray-500">{p.description}</p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {resources.length === 0 ? (
                      <span className="text-xs text-gray-400">None</span>
                    ) : (
                      resources.map((r) => (
                        <span
                          key={r}
                          title={(p.permissions[r] ?? []).join(", ")}
                          className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                        >
                          {r}
                        </span>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {roles.length === 0 ? (
                      <span className="text-xs text-gray-400">Unattached</span>
                    ) : (
                      roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700"
                        >
                          {role}
                        </span>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <PolicyRowActions id={p.id} label={p.label} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {policies.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          No policies yet —{" "}
          <Link href="/admin/policies/new" className="font-medium text-teal-600 hover:text-teal-700">
            create one
          </Link>
          .
        </p>
      )}
    </div>
  );
}
