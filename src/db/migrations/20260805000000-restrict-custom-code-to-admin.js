"use strict";

/**
 * 20260804010000-add-custom-code.js granted the new "customCode" resource to
 * both full-access (ADMIN) and content-and-leads (EDITOR). That was a mistake:
 * content-and-leads is scoped to blog content and lead triage, but customCode
 * lets its holder run arbitrary <script>/CSS on every public page - full site
 * compromise, not a content-editing permission. This revokes it from
 * content-and-leads, leaving only full-access.
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE "Policy" SET permissions = permissions - 'customCode' WHERE name = 'content-and-leads'`,
    );
  },

  async down(queryInterface) {
    const ALL_ACTIONS = JSON.stringify(["read", "create", "update", "delete"]);
    await queryInterface.sequelize.query(
      `UPDATE "Policy" SET permissions = permissions || jsonb_build_object('customCode', '${ALL_ACTIONS}'::jsonb) WHERE name = 'content-and-leads'`,
    );
  },
};
