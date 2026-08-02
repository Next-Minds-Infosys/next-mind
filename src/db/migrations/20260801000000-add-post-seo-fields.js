"use strict";

/**
 * SEO fields for the WordPress-style admin blog editor: title/description tag
 * overrides, a focus keyword for the on-page SEO checklist, and a canonical
 * URL override for posts republished from elsewhere.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Post", "metaTitle", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("Post", "metaDescription", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("Post", "focusKeyword", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("Post", "canonicalUrl", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Post", "metaTitle");
    await queryInterface.removeColumn("Post", "metaDescription");
    await queryInterface.removeColumn("Post", "focusKeyword");
    await queryInterface.removeColumn("Post", "canonicalUrl");
  },
};
