import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../sequelize";
import type { Policy } from "./policy";

export interface RolePolicyAttributes {
  id: string;
  /** Plain text, not a FK - Role is an app-level enum, not a table. */
  role: string;
  policyId: string;
  createdAt: Date;
  updatedAt: Date;
}

type RolePolicyCreation = Optional<RolePolicyAttributes, "id" | "createdAt" | "updatedAt">;

class RolePolicyModel
  extends Model<RolePolicyAttributes, RolePolicyCreation>
  implements RolePolicyAttributes
{
  declare id: string;
  declare role: string;
  declare policyId: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare policy?: Policy;
}

export const RolePolicy =
  (sequelize.models.RolePolicy as typeof RolePolicyModel | undefined) ?? RolePolicyModel;
export type RolePolicy = InstanceType<typeof RolePolicyModel>;

if (!sequelize.models.RolePolicy) {
  RolePolicy.init(
    {
      id: {
        type: DataTypes.TEXT,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
        primaryKey: true,
      },
      role: { type: DataTypes.TEXT, allowNull: false },
      policyId: { type: DataTypes.TEXT, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: "RolePolicy", modelName: "RolePolicy", timestamps: true },
  );
}
