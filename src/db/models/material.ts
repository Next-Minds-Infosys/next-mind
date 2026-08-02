import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../sequelize";

export interface MaterialAttributes {
  id: string;
  batchId: string;
  lessonId: string | null;
  title: string;
  storageKey: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  downloadable: boolean;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type MaterialCreation = Optional<
  MaterialAttributes,
  | "id"
  | "lessonId"
  | "mimeType"
  | "sizeBytes"
  | "downloadable"
  | "createdById"
  | "createdAt"
  | "updatedAt"
>;

class MaterialModel extends Model<MaterialAttributes, MaterialCreation> implements MaterialAttributes {
  declare id: string;
  declare batchId: string;
  declare lessonId: string | null;
  declare title: string;
  declare storageKey: string;
  declare fileName: string;
  declare mimeType: string | null;
  declare sizeBytes: number | null;
  declare downloadable: boolean;
  declare createdById: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

// Identity comes from the sequelize registry - see models/course.ts.
export const Material = (sequelize.models.Material as typeof MaterialModel | undefined) ?? MaterialModel;
export type Material = InstanceType<typeof MaterialModel>;

if (!sequelize.models.Material) {
  Material.init(
    {
      id: {
        type: DataTypes.TEXT,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
        primaryKey: true,
      },
      batchId: { type: DataTypes.TEXT, allowNull: false },
      lessonId: { type: DataTypes.TEXT, allowNull: true },
      title: { type: DataTypes.TEXT, allowNull: false },
      storageKey: { type: DataTypes.TEXT, allowNull: false },
      fileName: { type: DataTypes.TEXT, allowNull: false },
      mimeType: { type: DataTypes.TEXT, allowNull: true },
      sizeBytes: { type: DataTypes.BIGINT, allowNull: true },
      downloadable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      createdById: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: "Material", modelName: "Material", timestamps: true },
  );
}
