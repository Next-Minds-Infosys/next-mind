"use strict";

/**
 * Admin-issued accounts get a generated password that is emailed or handed over
 * verbally. Either way it has been seen by someone other than the account
 * holder, so it must be treated as compromised from the moment it is created.
 *
 * This flag forces a reset before the account can be used for anything else.
 * Defaults false so existing accounts (who chose their own password) are
 * unaffected.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("User", "mustChangePassword", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("User", "mustChangePassword");
  },
};
