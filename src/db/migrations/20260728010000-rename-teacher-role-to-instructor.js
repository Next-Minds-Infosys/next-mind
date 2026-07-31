"use strict";

/**
 * "TEACHER" was added by 20260727120000 and is already applied to both the
 * local and production databases, so the value has to be renamed in place
 * rather than edited into the earlier migration.
 *
 * ALTER TYPE ... RENAME VALUE is Postgres 10+ and rewrites existing rows'
 * labels automatically, so no data backfill is needed.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "Role" RENAME VALUE 'TEACHER' TO 'INSTRUCTOR'`,
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "Role" RENAME VALUE 'INSTRUCTOR' TO 'TEACHER'`,
    );
  },
};
