import { requireResource } from "@/lib/access";
import { RESOURCES } from "@/lib/policies";
import { PolicyEditor } from "../policy-editor";

export default async function NewPolicyPage() {
  await requireResource(RESOURCES.POLICIES, "create");
  return <PolicyEditor />;
}
