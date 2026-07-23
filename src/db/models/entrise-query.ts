import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../sequelize";
import type { SubmissionStatus } from "@/lib/types";

export interface EnterpriseInquiryAttributes {
  id: string;
  name: string;
  orgName: string;
  email: string;
  phone: string | null;
  orgType: string | null;
  teamSize: string | null;
  trainingInterests: string | null;
  status: SubmissionStatus;
  createdAt: Date;
}

type EnterpriseCreation = Optional<
  EnterpriseInquiryAttributes,
  "id" | "phone" | "orgType" | "teamSize" | "trainingInterests" | "status" | "createdAt"
>;

export class EnterpriseInquiry
  extends Model<EnterpriseInquiryAttributes, EnterpriseCreation>
  implements EnterpriseInquiryAttributes
{
  declare id: string;
  declare name: string;
  declare orgName: string;
  declare email: string;
  declare phone: string | null;
  declare orgType: string | null;
  declare teamSize: string | null;
  declare trainingInterests: string | null;
  declare status: SubmissionStatus;
  declare createdAt: Date;
}

EnterpriseInquiry.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    orgName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    orgType: { type: DataTypes.STRING, allowNull: true },
    teamSize: { type: DataTypes.STRING, allowNull: true },
    trainingInterests: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "PENDING" },
    createdAt: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: "EnterpriseInquiry", modelName: "EnterpriseInquiry", updatedAt: false }
);