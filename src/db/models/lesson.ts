import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../sequelize";

export interface LessonAttributes {
  id: string;
  batchId: string;
  title: string;
  description: string | null;
  orderIndex: number;
  videoKey: string | null;
  videoMime: string | null;
  videoSizeBytes: number | null;
  durationSeconds: number | null;
  published: boolean;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type LessonCreation = Optional<
  LessonAttributes,
  | "id"
  | "description"
  | "orderIndex"
  | "videoKey"
  | "videoMime"
  | "videoSizeBytes"
  | "durationSeconds"
  | "published"
  | "createdById"
  | "createdAt"
  | "updatedAt"
>;

class LessonModel extends Model<LessonAttributes, LessonCreation> implements LessonAttributes {
  declare id: string;
  declare batchId: string;
  declare title: string;
  declare description: string | null;
  declare orderIndex: number;
  declare videoKey: string | null;
  declare videoMime: string | null;
  declare videoSizeBytes: number | null;
  declare durationSeconds: number | null;
  declare published: boolean;
  declare createdById: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare materials?: import("./material").Material[];
}

// Identity comes from the sequelize registry - see models/course.ts.
export const Lesson = (sequelize.models.Lesson as typeof LessonModel | undefined) ?? LessonModel;
export type Lesson = InstanceType<typeof LessonModel>;

if (!sequelize.models.Lesson) {
  Lesson.init(
    {
      id: {
        type: DataTypes.TEXT,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
        primaryKey: true,
      },
      batchId: { type: DataTypes.TEXT, allowNull: false },
      title: { type: DataTypes.TEXT, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      orderIndex: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      videoKey: { type: DataTypes.TEXT, allowNull: true },
      videoMime: { type: DataTypes.TEXT, allowNull: true },
      videoSizeBytes: { type: DataTypes.BIGINT, allowNull: true },
      durationSeconds: { type: DataTypes.INTEGER, allowNull: true },
      published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      createdById: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: "Lesson", modelName: "Lesson", timestamps: true },
  );
}
