"use strict";

/**
 * Staff-only profile feature: a secondary contact email, confirmed via a
 * mailed token before it counts as verified. Token is stored as a sha256
 * hash (never the raw value) so a DB leak alone can't be used to confirm an
 * address that was never actually verified.
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("User", "secondaryEmail", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("User", "secondaryEmailVerified", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("User", "secondaryEmailToken", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("User", "secondaryEmailTokenExpires", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("User", "secondaryEmailTokenExpires");
    await queryInterface.removeColumn("User", "secondaryEmailToken");
    await queryInterface.removeColumn("User", "secondaryEmailVerified");
    await queryInterface.removeColumn("User", "secondaryEmail");
  },
};
