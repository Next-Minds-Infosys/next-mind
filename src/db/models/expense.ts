import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../sequelize";

export interface ExpenseAttributes {
  id: string;
  title: string;
  category: string;
  amount: number;
  vendor: string | null;
  spentAt: string;
  note: string | null;
  receiptKey: string | null;
  receiptName: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type ExpenseCreation = Optional<
  ExpenseAttributes,
  | "id"
  | "category"
  | "amount"
  | "vendor"
  | "note"
  | "receiptKey"
  | "receiptName"
  | "createdById"
  | "createdAt"
  | "updatedAt"
>;

class ExpenseModel extends Model<ExpenseAttributes, ExpenseCreation> implements ExpenseAttributes {
  declare id: string;
  declare title: string;
  declare category: string;
  declare amount: number;
  declare vendor: string | null;
  declare spentAt: string;
  declare note: string | null;
  declare receiptKey: string | null;
  declare receiptName: string | null;
  declare createdById: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const Expense = (sequelize.models.Expense as typeof ExpenseModel | undefined) ?? ExpenseModel;
export type Expense = InstanceType<typeof ExpenseModel>;

if (!sequelize.models.Expense) {
  Expense.init(
    {
      id: {
        type: DataTypes.TEXT,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
        primaryKey: true,
      },
      title: { type: DataTypes.TEXT, allowNull: false },
      category: { type: DataTypes.TEXT, allowNull: false, defaultValue: "Other" },
      amount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      vendor: { type: DataTypes.TEXT, allowNull: true },
      spentAt: { type: DataTypes.DATEONLY, allowNull: false },
      note: { type: DataTypes.TEXT, allowNull: true },
      receiptKey: { type: DataTypes.TEXT, allowNull: true },
      receiptName: { type: DataTypes.TEXT, allowNull: true },
      createdById: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: "Expense", modelName: "Expense", timestamps: true },
  );
}
