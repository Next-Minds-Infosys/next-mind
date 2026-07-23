import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../sequelize";
import type { SubmissionStatus } from "@/lib/types";
import type { Course } from "./course";

export interface EnrollmentAttributes {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string | null;
  courseId: string;
  educationLevel: string | null;
  learningFormat: string;
  hasLaptop: string;
  userId: string | null;
  status: SubmissionStatus;
  createdAt: Date;
}

type EnrollmentCreation = Optional<
  EnrollmentAttributes,
  "id" | "address" | "educationLevel" | "userId" | "status" | "createdAt"
>;

export class Enrollment
  extends Model<EnrollmentAttributes, EnrollmentCreation>
  implements EnrollmentAttributes
{
  declare id: string;
  declare fullName: string;
  declare email: string;
  declare phone: string;
  declare address: string | null;
  declare courseId: string;
  declare educationLevel: string | null;
  declare learningFormat: string;
  declare hasLaptop: string;
  declare userId: string | null;
  declare status: SubmissionStatus;
  declare createdAt: Date;
  declare course?: Course;
}

Enrollment.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    fullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: true },
    courseId: { type: DataTypes.STRING, allowNull: false },
    educationLevel: { type: DataTypes.STRING, allowNull: true },
    learningFormat: { type: DataTypes.STRING, allowNull: false },
    hasLaptop: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "PENDING" },
    createdAt: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: "Enrollment", modelName: "Enrollment", updatedAt: false }
);