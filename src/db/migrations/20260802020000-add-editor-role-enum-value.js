"use strict";

/**
 * User.role is actually a Postgres enum type ("Role"), not the free-form TEXT
 * the Sequelize model suggests - EDITOR must be added here or it 500s on use.
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EDITOR'`);
  },

  // Postgres has no DROP VALUE for enums - removing one means recreating the
  // type and every column/constraint that depends on it, which is out of
  // proportion for a rollback. Left as a no-op; the mere presence of an
  // unused enum value is harmless.
  async down() {},
};
