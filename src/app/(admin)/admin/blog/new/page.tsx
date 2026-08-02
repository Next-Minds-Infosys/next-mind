import { requireResource } from "@/lib/access";
import { RESOURCES } from "@/lib/policies";
import { PostEditor } from "../post-editor";

export default async function NewPostPage() {
  await requireResource(RESOURCES.BLOG, "create");
  return <PostEditor />;
}
