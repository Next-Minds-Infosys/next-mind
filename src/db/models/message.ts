import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../sequelize";

export interface MessageAttributes {
  id: string;
  batchId: string;
  authorId: string;
  body: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type MessageCreation = Optional<
  MessageAttributes,
  | "id"
  | "parentId"
  | "createdAt"
  | "updatedAt"
>;

class MessageModel extends Model<MessageAttributes, MessageCreation> implements MessageAttributes {
  declare id: string;
  declare batchId: string;
  declare authorId: string;
  declare body: string;
  declare parentId: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare author?: import("./user").User;
  declare replies?: import("./message").Message[];
}

// Identity comes from the sequelize registry - see models/course.ts.
export const Message = (sequelize.models.Message as typeof MessageModel | undefined) ?? MessageModel;
export type Message = InstanceType<typeof MessageModel>;

if (!sequelize.models.Message) {
  Message.init(
    {
      id: {
        type: DataTypes.TEXT,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
        primaryKey: true,
      },
      batchId: { type: DataTypes.TEXT, allowNull: false },
      authorId: { type: DataTypes.TEXT, allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      parentId: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: "Message", modelName: "Message", timestamps: true },
  );
}
