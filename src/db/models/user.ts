import { DataTypes, Model, Optional } from "sequelize";
import type { Role } from "@/lib/types";
import { sequelize } from "../sequelize"

export interface UserAttributes {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

type UserCreation = Optional<UserAttributes, "id" | "name" | "emailVerified" | "image" | "role" | "createdAt" | "updatedAt">;

export class User extends Model<UserAttributes, UserCreation> implements UserAttributes {
  declare id: string;
  declare name: string | null;
  declare email: string;
  declare emailVerified: boolean;
  declare image: string | null;
  declare role: Role;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    emailVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    image: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: "STUDENT" },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: "User", modelName: "User" }
);