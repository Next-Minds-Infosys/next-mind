"use strict";

/**
 * Custom Code admin section: a single-row table holding a raw script snippet
 * and raw CSS injected into the public site only (src/components/SiteLayout.tsx).
 *
 * Also grants the new "customCode" resource to the two policies seeded by
 * 20260802000000-add-policies.js. Adding a key to RESOURCES in
 * src/lib/policies.ts does not retroactively appear in a Policy row's
 * `permissions` JSONB - that blob was computed once at insert time - so
 * without this, neither ADMIN's full-access nor EDITOR's content-and-leads
 * policy would see the new section until someone re-saved it by hand in
 * /admin/policies.
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("SiteSetting", {
      id: { type: Sequelize.TEXT, primaryKey: true, allowNull: false, defaultValue: "default" },
      customScript: { type: Sequelize.TEXT, allowNull: true },
      customCss: { type: Sequelize.TEXT, allowNull: true },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    const ALL_ACTIONS = JSON.stringify(["read", "create", "update", "delete"]);
    await queryInterface.sequelize.query(
      `UPDATE "Policy" SET permissions = permissions || jsonb_build_object('customCode', '${ALL_ACTIONS}'::jsonb) WHERE name IN ('full-access', 'content-and-leads')`,
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE "Policy" SET permissions = permissions - 'customCode' WHERE name IN ('full-access', 'content-and-leads')`,
    );
    await queryInterface.dropTable("SiteSetting");
  },
};
