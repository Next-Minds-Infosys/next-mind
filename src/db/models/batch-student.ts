import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../sequelize";

export type BatchStudentStatus = "ACTIVE" | "DROPPED";

export interface BatchStudentAttributes {
  id: string;
  batchId: string;
  userId: string;
  status: BatchStudentStatus;
  enrolledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

type BatchStudentCreation = Optional<
  BatchStudentAttributes,
  "id" | "status" | "enrolledAt" | "createdAt" | "updatedAt"
>;

class BatchStudentModel
  extends Model<BatchStudentAttributes, BatchStudentCreation>
  implements BatchStudentAttributes
{
  declare id: string;
  declare batchId: string;
  declare userId: string;
  declare status: BatchStudentStatus;
  declare enrolledAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare batch?: import("./batch").Batch;
  declare user?: import("./user").User;
}

export const BatchStudent =
  (sequelize.models.BatchStudent as typeof BatchStudentModel | undefined) ?? BatchStudentModel;
export type BatchStudent = InstanceType<typeof BatchStudentModel>;

if (!sequelize.models.BatchStudent) {
  BatchStudent.init(
    {
      id: {
        type: DataTypes.TEXT,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
        primaryKey: true,
      },
      batchId: { type: DataTypes.TEXT, allowNull: false },
      userId: { type: DataTypes.TEXT, allowNull: false },
      status: { type: DataTypes.TEXT, allowNull: false, defaultValue: "ACTIVE" },
      enrolledAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: "BatchStudent",
      modelName: "BatchStudent",
      timestamps: true,
      indexes: [{ unique: true, fields: ["batchId", "userId"] }],
    },
  );
}
