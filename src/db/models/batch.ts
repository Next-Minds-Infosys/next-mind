import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../sequelize";

export type BatchMode = "Physical" | "Online" | "Hybrid";
export type BatchStatus = "UPCOMING" | "RUNNING" | "COMPLETED";

export interface BatchAttributes {
  id: string;
  courseId: string;
  instructorId: string | null;
  name: string;
  code: string;
  startDate: string | null;
  endDate: string | null;
  schedule: string | null;
  mode: BatchMode;
  capacity: number;
  status: BatchStatus;
  createdAt: Date;
  updatedAt: Date;
}

type BatchCreation = Optional<
  BatchAttributes,
  | "id"
  | "instructorId"
  | "startDate"
  | "endDate"
  | "schedule"
  | "mode"
  | "capacity"
  | "status"
  | "createdAt"
  | "updatedAt"
>;

class BatchModel extends Model<BatchAttributes, BatchCreation> implements BatchAttributes {
  declare id: string;
  declare courseId: string;
  declare instructorId: string | null;
  declare name: string;
  declare code: string;
  declare startDate: string | null;
  declare endDate: string | null;
  declare schedule: string | null;
  declare mode: BatchMode;
  declare capacity: number;
  declare status: BatchStatus;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare course?: import("./course").Course;
  declare instructor?: import("./user").User;
  declare students?: import("./batch-student").BatchStudent[];
}

// Identity must come from the sequelize instance's own registry - see the note
// in models/course.ts.
export const Batch = (sequelize.models.Batch as typeof BatchModel | undefined) ?? BatchModel;
export type Batch = InstanceType<typeof BatchModel>;

if (!sequelize.models.Batch) {
  Batch.init(
    {
      id: {
        type: DataTypes.TEXT,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
        primaryKey: true,
      },
      courseId: { type: DataTypes.TEXT, allowNull: false },
      instructorId: { type: DataTypes.TEXT, allowNull: true },
      name: { type: DataTypes.TEXT, allowNull: false },
      code: { type: DataTypes.TEXT, allowNull: false, unique: true },
      startDate: { type: DataTypes.DATEONLY, allowNull: true },
      endDate: { type: DataTypes.DATEONLY, allowNull: true },
      schedule: { type: DataTypes.TEXT, allowNull: true },
      mode: { type: DataTypes.TEXT, allowNull: false, defaultValue: "Physical" },
      capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      status: { type: DataTypes.TEXT, allowNull: false, defaultValue: "UPCOMING" },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: "Batch", modelName: "Batch", timestamps: true },
  );
}
