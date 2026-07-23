import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../sequelize";

export interface CourseAttributes {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  contentMd: string;
  tools: string[];
  duration: string;
  level: string;
  price: string;
  imageUrl: string | null;
  published: boolean;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type CourseCreation = Optional<
  CourseAttributes,
  "id" | "imageUrl" | "published" | "createdById" | "createdAt" | "updatedAt"
>;

export class Course extends Model<CourseAttributes, CourseCreation> implements CourseAttributes {
  declare id: string;
  declare slug: string;
  declare category: string;
  declare title: string;
  declare description: string;
  declare contentMd: string;
  declare tools: string[];
  declare duration: string;
  declare level: string;
  declare price: string;
  declare imageUrl: string | null;
  declare published: boolean;
  declare createdById: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare enrollments?: import("./enrollment").Enrollment[];
}

Course.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contentMd: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tools: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    level: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    tableName: "Course",
    modelName: "Course",
    timestamps: true,
  }
);