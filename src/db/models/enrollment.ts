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

class EnrollmentModel
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

// Model identity must match the `Model` base class of the same sequelize
// instance, or Sequelize's `instanceof Model` checks fail when defining
// associations. `sequelize.models` is that instance's own registry, so it stays
// consistent both in dev (shared cached instance) and in a production build
// (one instance per module graph). A separate globalThis key would not: the
// sequelize instance is only cached outside production, so cached classes could
// outlive the `Model` they extend.

export const Enrollment = (sequelize.models.Enrollment as typeof EnrollmentModel | undefined) ?? EnrollmentModel;
// The class name doubles as an instance type in TypeScript; re-declare that
// here since `Enrollment` above is a `const` binding, not the class declaration.
export type Enrollment = InstanceType<typeof EnrollmentModel>;

if (!sequelize.models.Enrollment) {

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
    { sequelize, tableName: "Enrollment", modelName: "Enrollment", updatedAt: false },
  );
}
