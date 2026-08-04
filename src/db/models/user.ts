import { DataTypes, Model, Optional } from "sequelize";
import type { Role } from "@/lib/types";
import { sequelize } from "../sequelize";

export interface UserAttributes {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  mustChangePassword: boolean;
  image: string | null;
  role: Role;
  /** Unverified until the token link below is clicked. Staff-only profile feature. */
  secondaryEmail: string | null;
  secondaryEmailVerified: boolean;
  /** sha256 hex digest of the emailed token - never the raw value, in case the row leaks. */
  secondaryEmailToken: string | null;
  secondaryEmailTokenExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type UserCreation = Optional<
  UserAttributes,
  | "mustChangePassword"
  | "id"
  | "name"
  | "emailVerified"
  | "image"
  | "role"
  | "secondaryEmail"
  | "secondaryEmailVerified"
  | "secondaryEmailToken"
  | "secondaryEmailTokenExpires"
  | "createdAt"
  | "updatedAt"
>;

class UserModel extends Model<UserAttributes, UserCreation> implements UserAttributes {
  declare id: string;
  declare name: string | null;
  declare email: string;
  declare emailVerified: boolean;
  declare mustChangePassword: boolean;
  declare image: string | null;
  declare role: Role;
  declare secondaryEmail: string | null;
  declare secondaryEmailVerified: boolean;
  declare secondaryEmailToken: string | null;
  declare secondaryEmailTokenExpires: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

// Model identity must match the `Model` base class of the same sequelize
// instance, or Sequelize's `instanceof Model` checks fail when defining
// associations. `sequelize.models` is that instance's own registry, so it stays
// consistent both in dev (shared cached instance) and in a production build
// (one instance per module graph). A separate globalThis key would not: the
// sequelize instance is only cached outside production, so cached classes could
// outlive the `Model` they extend.

export const User = (sequelize.models.User as typeof UserModel | undefined) ?? UserModel;
// The class name doubles as an instance type in TypeScript; re-declare that
// here since `User` above is a `const` binding, not the class declaration.
export type User = InstanceType<typeof UserModel>;

if (!sequelize.models.User) {

  User.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      emailVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      mustChangePassword: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      image: { type: DataTypes.STRING, allowNull: true },
      role: { type: DataTypes.STRING, allowNull: false, defaultValue: "STUDENT" },
      secondaryEmail: { type: DataTypes.STRING, allowNull: true },
      secondaryEmailVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      secondaryEmailToken: { type: DataTypes.STRING, allowNull: true },
      secondaryEmailTokenExpires: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: "User", modelName: "User" },
  );
}
