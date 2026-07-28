"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'TEACHER'`);
  },

  async down(queryInterface) {
    // Postgres can't drop a single enum value directly: rebuild the type
    // without it. Fails loudly (invalid input value) if any "User" row is
    // still set to TEACHER, which is the correct behavior for a down migration.
    await queryInterface.sequelize.query(`ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT`);
    await queryInterface.sequelize.query(`ALTER TYPE "Role" RENAME TO "Role_old"`);
    await queryInterface.sequelize.query(`CREATE TYPE "Role" AS ENUM ('ADMIN', 'STUDENT')`);
    await queryInterface.sequelize.query(
      `ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING "role"::text::"Role"`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STUDENT'`,
    );
    await queryInterface.sequelize.query(`DROP TYPE "Role_old"`);
  },
};
