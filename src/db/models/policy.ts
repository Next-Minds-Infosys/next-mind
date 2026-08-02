import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../sequelize";
import type { PermissionMap } from "@/lib/policies";

export interface PolicyAttributes {
  id: string;
  name: string;
  label: string;
  description: string | null;
  permissions: PermissionMap;
  createdAt: Date;
  updatedAt: Date;
}

type PolicyCreation = Optional<
  PolicyAttributes,
  "id" | "description" | "permissions" | "createdAt" | "updatedAt"
>;

class PolicyModel extends Model<PolicyAttributes, PolicyCreation> implements PolicyAttributes {
  declare id: string;
  declare name: string;
  declare label: string;
  declare description: string | null;
  declare permissions: PermissionMap;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare roleAttachments?: import("./role-policy").RolePolicy[];
}

export const Policy = (sequelize.models.Policy as typeof PolicyModel | undefined) ?? PolicyModel;
export type Policy = InstanceType<typeof PolicyModel>;

if (!sequelize.models.Policy) {
  Policy.init(
    {
      id: {
        type: DataTypes.TEXT,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
        primaryKey: true,
      },
      name: { type: DataTypes.TEXT, allowNull: false, unique: true },
      label: { type: DataTypes.TEXT, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      permissions: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: "Policy", modelName: "Policy", timestamps: true },
  );
}
