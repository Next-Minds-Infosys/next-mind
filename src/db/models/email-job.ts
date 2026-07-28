import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../sequelize";
import type { EmailJobStatus } from "@/lib/types";

export interface EmailJobAttributes {
  id: string;
  subject: string;
  html: string;
  replyTo: string | null;
  status: EmailJobStatus;
  attempts: number;
  lastError: string | null;
  createdAt: Date;
  sentAt: Date | null;
}

type EmailJobCreation = Optional<
  EmailJobAttributes,
  "id" | "replyTo" | "status" | "attempts" | "lastError" | "createdAt" | "sentAt"
>;

export class EmailJob
  extends Model<EmailJobAttributes, EmailJobCreation>
  implements EmailJobAttributes
{
  declare id: string;
  declare subject: string;
  declare html: string;
  declare replyTo: string | null;
  declare status: EmailJobStatus;
  declare attempts: number;
  declare lastError: string | null;
  declare createdAt: Date;
  declare sentAt: Date | null;
}

EmailJob.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    subject: { type: DataTypes.STRING, allowNull: false },
    html: { type: DataTypes.TEXT, allowNull: false },
    replyTo: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "PENDING" },
    attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    lastError: { type: DataTypes.STRING, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    sentAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: "EmailJob", modelName: "EmailJob", updatedAt: false },
);
