import { DataTypes, Model, Optional } from "sequelize";
import type { Role } from "@/lib/types";
import { sequelize } from "../sequelize";

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

type UserCreation = Optional<
  UserAttributes,
  "id" | "name" | "emailVerified" | "image" | "role" | "createdAt" | "updatedAt"
>;

class UserModel extends Model<UserAttributes, UserCreation> implements UserAttributes {
  declare id: string;
  declare name: string | null;
  declare email: string;
  declare emailVerified: boolean;
  declare image: string | null;
  declare role: Role;
  declare createdAt: Date;
  declare updatedAt: Date;
}

// Next's dev server (Turbopack/Fast Refresh) can re-evaluate this module
// while other already-loaded modules (e.g. the associations in src/db/index.ts)
// still reference the previous evaluation's class. Two different `User`
// classes then fail Sequelize's `instanceof Model` checks. Caching on
// globalThis (matching src/db/sequelize.ts) keeps one instance per process.
const globalForUserModel = globalThis as unknown as { User?: typeof UserModel };

export const User = globalForUserModel.User ?? UserModel;
// The class name doubles as an instance type in TypeScript; re-declare that
// here since `User` above is a `const` binding, not the class declaration.
export type User = InstanceType<typeof UserModel>;

if (!globalForUserModel.User) {
  globalForUserModel.User = User;

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
    { sequelize, tableName: "User", modelName: "User" },
  );
}
