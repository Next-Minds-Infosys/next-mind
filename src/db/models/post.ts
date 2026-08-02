import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../sequelize";

export interface PostAttributes {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentMd: string;
  category: string | null;
  emoji: string | null;
  coverKey: string | null;
  readTime: string | null;
  authorName: string | null;
  authorId: string | null;
  featured: boolean;
  published: boolean;
  publishedAt: Date | null;
  /** SEO title tag - falls back to `title` when empty. */
  metaTitle: string | null;
  /** SEO meta description - falls back to `excerpt` when empty. */
  metaDescription: string | null;
  /** Target keyword the admin SEO checklist scores against. */
  focusKeyword: string | null;
  /** Canonical URL override, for posts republished from elsewhere. */
  canonicalUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type PostCreation = Optional<
  PostAttributes,
  | "id"
  | "excerpt"
  | "contentMd"
  | "category"
  | "emoji"
  | "coverKey"
  | "readTime"
  | "authorName"
  | "authorId"
  | "featured"
  | "published"
  | "publishedAt"
  | "metaTitle"
  | "metaDescription"
  | "focusKeyword"
  | "canonicalUrl"
  | "createdAt"
  | "updatedAt"
>;

class PostModel extends Model<PostAttributes, PostCreation> implements PostAttributes {
  declare id: string;
  declare slug: string;
  declare title: string;
  declare excerpt: string | null;
  declare contentMd: string;
  declare category: string | null;
  declare emoji: string | null;
  declare coverKey: string | null;
  declare readTime: string | null;
  declare authorName: string | null;
  declare authorId: string | null;
  declare featured: boolean;
  declare published: boolean;
  declare publishedAt: Date | null;
  declare metaTitle: string | null;
  declare metaDescription: string | null;
  declare focusKeyword: string | null;
  declare canonicalUrl: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const Post = (sequelize.models.Post as typeof PostModel | undefined) ?? PostModel;
export type Post = InstanceType<typeof PostModel>;

if (!sequelize.models.Post) {
  Post.init(
    {
      id: {
        type: DataTypes.TEXT,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
        primaryKey: true,
      },
      slug: { type: DataTypes.TEXT, allowNull: false, unique: true },
      title: { type: DataTypes.TEXT, allowNull: false },
      excerpt: { type: DataTypes.TEXT, allowNull: true },
      contentMd: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
      category: { type: DataTypes.TEXT, allowNull: true },
      emoji: { type: DataTypes.TEXT, allowNull: true },
      coverKey: { type: DataTypes.TEXT, allowNull: true },
      readTime: { type: DataTypes.TEXT, allowNull: true },
      authorName: { type: DataTypes.TEXT, allowNull: true },
      authorId: { type: DataTypes.TEXT, allowNull: true },
      featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      publishedAt: { type: DataTypes.DATE, allowNull: true },
      metaTitle: { type: DataTypes.TEXT, allowNull: true },
      metaDescription: { type: DataTypes.TEXT, allowNull: true },
      focusKeyword: { type: DataTypes.TEXT, allowNull: true },
      canonicalUrl: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: "Post", modelName: "Post", timestamps: true },
  );
}
