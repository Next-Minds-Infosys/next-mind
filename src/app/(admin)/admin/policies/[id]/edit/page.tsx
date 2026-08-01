import { notFound } from "next/navigation";
import { Policy, RolePolicy } from "@/db";
import { requireResource } from "@/lib/access";
import { RESOURCES } from "@/lib/policies";
import { PolicyEditor } from "../../policy-editor";

export default async function EditPolicyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireResource(RESOURCES.POLICIES, "update");
  const { id } = await params;

  const policy = await Policy.findByPk(id, {
    include: [{ model: RolePolicy, as: "roleAttachments" }],
  });
  if (!policy) notFound();

  return (
    <PolicyEditor
      initial={{
        id: policy.id,
        name: policy.name,
        label: policy.label,
        description: policy.description ?? "",
        permissions: policy.permissions ?? {},
        roles: (policy.roleAttachments ?? []).map((r) => r.role) as ("ADMIN" | "EDITOR")[],
      }}
    />
  );
}
