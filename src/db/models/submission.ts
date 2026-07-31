import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../sequelize";

export interface SubmissionAttributes {
  id: string;
  assignmentId: string;
  userId: string;
  storageKey: string | null;
  fileName: string | null;
  note: string | null;
  submittedAt: Date;
  score: number | null;
  feedback: string | null;
  gradedById: string | null;
  gradedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type SubmissionCreation = Optional<
  SubmissionAttributes,
  | "id"
  | "storageKey"
  | "fileName"
  | "note"
  | "submittedAt"
  | "score"
  | "feedback"
  | "gradedById"
  | "gradedAt"
  | "createdAt"
  | "updatedAt"
>;

class SubmissionModel extends Model<SubmissionAttributes, SubmissionCreation> implements SubmissionAttributes {
  declare id: string;
  declare assignmentId: string;
  declare userId: string;
  declare storageKey: string | null;
  declare fileName: string | null;
  declare note: string | null;
  declare submittedAt: Date;
  declare score: number | null;
  declare feedback: string | null;
  declare gradedById: string | null;
  declare gradedAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare user?: import("./user").User;
  declare assignment?: import("./assignment").Assignment;
}

// Identity comes from the sequelize registry - see models/course.ts.
export const Submission = (sequelize.models.Submission as typeof SubmissionModel | undefined) ?? SubmissionModel;
export type Submission = InstanceType<typeof SubmissionModel>;

if (!sequelize.models.Submission) {
  Submission.init(
    {
      id: {
        type: DataTypes.TEXT,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
        primaryKey: true,
      },
      assignmentId: { type: DataTypes.TEXT, allowNull: false },
      userId: { type: DataTypes.TEXT, allowNull: false },
      storageKey: { type: DataTypes.TEXT, allowNull: true },
      fileName: { type: DataTypes.TEXT, allowNull: true },
      note: { type: DataTypes.TEXT, allowNull: true },
      submittedAt: { type: DataTypes.DATE, allowNull: false },
      score: { type: DataTypes.INTEGER, allowNull: true },
      feedback: { type: DataTypes.TEXT, allowNull: true },
      gradedById: { type: DataTypes.TEXT, allowNull: true },
      gradedAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: "Submission", modelName: "Submission", timestamps: true,
      indexes: [{ unique: true, fields: ["assignmentId", "userId"] }], },
  );
}
