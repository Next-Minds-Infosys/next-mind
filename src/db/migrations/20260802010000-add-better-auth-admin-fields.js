"use strict";

/**
 * Columns better-auth's "admin" plugin expects on User/Session. Only
 * setUserPassword/revokeUserSessions are used, but the plugin applies its
 * schema to the whole model, so these must exist even though ban/impersonate aren't wired up.
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("User", "banned", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
    await queryInterface.addColumn("User", "banReason", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("User", "banExpires", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("Session", "impersonatedBy", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Session", "impersonatedBy");
    await queryInterface.removeColumn("User", "banExpires");
    await queryInterface.removeColumn("User", "banReason");
    await queryInterface.removeColumn("User", "banned");
  },
};
