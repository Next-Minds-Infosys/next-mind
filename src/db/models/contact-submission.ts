import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../sequelize";
import type { SubmissionStatus } from "@/lib/types";

export interface ContactSubmissionAttributes {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  courseInterest: string | null;
  message: string;
  status: SubmissionStatus;
  createdAt: Date;
}

type ContactCreation = Optional<
  ContactSubmissionAttributes,
  "id" | "phone" | "courseInterest" | "status" | "createdAt"
>;

export class ContactSubmission
  extends Model<ContactSubmissionAttributes, ContactCreation>
  implements ContactSubmissionAttributes
{
  declare id: string;
  declare name: string;
  declare email: string;
  declare phone: string | null;
  declare courseInterest: string | null;
  declare message: string;
  declare status: SubmissionStatus;
  declare createdAt: Date;
}

ContactSubmission.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    courseInterest: { type: DataTypes.STRING, allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "PENDING" },
    createdAt: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: "ContactSubmission", modelName: "ContactSubmission", updatedAt: false }
);