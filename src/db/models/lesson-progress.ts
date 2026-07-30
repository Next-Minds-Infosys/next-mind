import { DataTypes, Model, Sequelize, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import { sequelize } from "../sequelize";

class LessonProgressModel extends Model<
  InferAttributes<LessonProgressModel>,
  InferCreationAttributes<LessonProgressModel>
> {
  declare id: CreationOptional<string>;
  declare lessonId: string;
  declare userId: string;
  declare completedAt: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export const LessonProgress =
  (sequelize.models.LessonProgress as typeof LessonProgressModel | undefined) ??
  LessonProgressModel;
export type LessonProgress = InstanceType<typeof LessonProgressModel>;

if (!sequelize.models.LessonProgress) {
  LessonProgress.init(
    {
      id: {
        type: DataTypes.TEXT,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
        primaryKey: true,
      },
      lessonId: { type: DataTypes.TEXT, allowNull: false },
      userId: { type: DataTypes.TEXT, allowNull: false },
      completedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: "LessonProgress", modelName: "LessonProgress", timestamps: true },
  );
}
