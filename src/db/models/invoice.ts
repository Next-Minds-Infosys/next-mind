import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../sequelize";

export interface InvoiceAttributes {
  id: string;
  invoiceNo: string;
  userId: string;
  batchId: string | null;
  description: string;
  amount: number;
  discount: number;
  total: number;
  paidAmount: number;
  status: string;
  method: string | null;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  note: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type InvoiceCreation = Optional<
  InvoiceAttributes,
  | "id"
  | "batchId"
  | "amount"
  | "discount"
  | "total"
  | "paidAmount"
  | "status"
  | "method"
  | "issuedAt"
  | "dueAt"
  | "paidAt"
  | "note"
  | "createdById"
  | "createdAt"
  | "updatedAt"
>;

class InvoiceModel extends Model<InvoiceAttributes, InvoiceCreation> implements InvoiceAttributes {
  declare id: string;
  declare invoiceNo: string;
  declare userId: string;
  declare batchId: string | null;
  declare description: string;
  declare amount: number;
  declare discount: number;
  declare total: number;
  declare paidAmount: number;
  declare status: string;
  declare method: string | null;
  declare issuedAt: string | null;
  declare dueAt: string | null;
  declare paidAt: string | null;
  declare note: string | null;
  declare createdById: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare student?: import("./user").User;
  declare batch?: import("./batch").Batch;
}

export const Invoice = (sequelize.models.Invoice as typeof InvoiceModel | undefined) ?? InvoiceModel;
export type Invoice = InstanceType<typeof InvoiceModel>;

if (!sequelize.models.Invoice) {
  Invoice.init(
    {
      id: {
        type: DataTypes.TEXT,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
        primaryKey: true,
      },
      invoiceNo: { type: DataTypes.TEXT, allowNull: false, unique: true },
      userId: { type: DataTypes.TEXT, allowNull: false },
      batchId: { type: DataTypes.TEXT, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: false },
      amount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      discount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      total: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      paidAmount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      status: { type: DataTypes.TEXT, allowNull: false, defaultValue: "UNPAID" },
      method: { type: DataTypes.TEXT, allowNull: true },
      issuedAt: { type: DataTypes.DATEONLY, allowNull: true },
      dueAt: { type: DataTypes.DATEONLY, allowNull: true },
      paidAt: { type: DataTypes.DATEONLY, allowNull: true },
      note: { type: DataTypes.TEXT, allowNull: true },
      createdById: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: "Invoice", modelName: "Invoice", timestamps: true },
  );
}
