import { Op } from "sequelize";
import { Post } from "@/db";
import { requireResource } from "@/lib/access";
import { RESOURCES } from "@/lib/policies";
import { PostEditor } from "../post-editor";

export default async function NewPostPage() {
  await requireResource(RESOURCES.BLOG, "create");
  const others = await Post.findAll({
    attributes: ["focusKeyword"],
    where: { focusKeyword: { [Op.not]: null } },
  });
  const usedKeywords = others.map((p) => p.focusKeyword!).filter(Boolean);
  return <PostEditor usedKeywords={usedKeywords} />;
}
