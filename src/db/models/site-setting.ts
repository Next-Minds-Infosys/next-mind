import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../sequelize";

/** Only row ever read/written - see SITE_SETTING_ID in src/db/queries.ts / actions.ts. */
export const SITE_SETTING_ID = "default";

export interface SiteSettingAttributes {
  id: string;
  /** Raw HTML - may contain one or more <script> tags (external src and/or inline). Public site only. */
  customScript: string | null;
  /** Raw CSS rules, no wrapping <style> tag. Public site only. */
  customCss: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type SiteSettingCreation = Optional<
  SiteSettingAttributes,
  "id" | "customScript" | "customCss" | "createdAt" | "updatedAt"
>;

class SiteSettingModel
  extends Model<SiteSettingAttributes, SiteSettingCreation>
  implements SiteSettingAttributes
{
  declare id: string;
  declare customScript: string | null;
  declare customCss: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const SiteSetting =
  (sequelize.models.SiteSetting as typeof SiteSettingModel | undefined) ?? SiteSettingModel;
export type SiteSetting = InstanceType<typeof SiteSettingModel>;

if (!sequelize.models.SiteSetting) {
  SiteSetting.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true, defaultValue: SITE_SETTING_ID },
      customScript: { type: DataTypes.TEXT, allowNull: true },
      customCss: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, tableName: "SiteSetting", modelName: "SiteSetting" },
  );
}
