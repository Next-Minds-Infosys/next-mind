import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../sequelize";

export interface AssignmentAttributes {
  id: string;
  batchId: string;
  title: string;
  briefMd: string;
  attachmentKey: string | null;
  attachmentName: string | null;
  dueAt: Date | null;
  maxScore: number;
  published: boolean;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type AssignmentCreation = Optional<
  AssignmentAttributes,
  | "id"
  | "briefMd"
  | "attachmentKey"
  | "attachmentName"
  | "dueAt"
  | "maxScore"
  | "published"
  | "createdById"
  | "createdAt"
  | "updatedAt"
>;

class AssignmentModel extends Model<AssignmentAttributes, AssignmentCreation> implements AssignmentAttributes {
  declare id: string;
  declare batchId: string;
  declare title: string;
  declare briefMd: string;
  declare attachmentKey: string | null;
  declare attachmentName: string | null;
  declare dueAt: Date | null;
  declare maxScore: number;
  declare published: boolean;
  declare createdById: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare submissions?: import("./submission").Submission[];
  // Populated by `include: [{ model: Batch, as: "batch" }]`.
  declare batch?: import("./batch").Batch;
}

// Identity comes from the sequelize registry - see models/course.ts.
export const Assignment = (sequelize.models.Assignment as typeof AssignmentModel | undefined) ?? AssignmentModel;
export type Assignment = InstanceType<typeof AssignmentModel>;

if (!sequelize.models.Assignment) {
  Assignment.init(
    {
      id: {
        type: DataTypes.TEXT,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
        primaryKey: true,
      },
      batchId: { type: DataTypes.TEXT, allowNull: false },
      title: { type: DataTypes.TEXT, allowNull: false },
      briefMd: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
      attachmentKey: { type: DataTypes.TEXT, allowNull: true },
      attachmentName: { type: DataTypes.TEXT, allowNull: true },
      dueAt: { type: DataTypes.DATE, allowNull: true },
      maxScore: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
      published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      createdById: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: "Assignment", modelName: "Assignment", timestamps: true },
  );
}
