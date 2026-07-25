"use strict";

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await queryInterface.createTable("Category", {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
      },
      name: { type: Sequelize.TEXT, allowNull: false, unique: true },
      slug: { type: Sequelize.TEXT, allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });

    // Course.id was previously generated client-side (Sequelize UUIDV4); align it with
    // Category and generate server-side going forward.
    await queryInterface.sequelize.query(
      `ALTER TABLE "Course" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text`
    );

    await queryInterface.addColumn("Course", "categoryId", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    const [distinctCategories] = await queryInterface.sequelize.query(
      `SELECT DISTINCT "category" FROM "Course"`
    );

    for (const row of distinctCategories) {
      const name = row.category;
      const [[category]] = await queryInterface.sequelize.query(
        `INSERT INTO "Category" ("name", "slug", "createdAt", "updatedAt")
         VALUES (:name, :slug, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING "id"`,
        { replacements: { name, slug: slugify(name) } }
      );
      await queryInterface.sequelize.query(
        `UPDATE "Course" SET "categoryId" = :id WHERE "category" = :name`,
        { replacements: { id: category.id, name } }
      );
    }

    await queryInterface.changeColumn("Course", "categoryId", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.addConstraint("Course", {
      fields: ["categoryId"],
      type: "foreign key",
      name: "Course_categoryId_fkey",
      references: { table: "Category", field: "id" },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    await queryInterface.removeColumn("Course", "category");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Course", "category", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      `UPDATE "Course" c SET "category" = cat."name" FROM "Category" cat WHERE cat."id" = c."categoryId"`
    );

    await queryInterface.changeColumn("Course", "category", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.removeConstraint("Course", "Course_categoryId_fkey");
    await queryInterface.removeColumn("Course", "categoryId");
    await queryInterface.sequelize.query(`ALTER TABLE "Course" ALTER COLUMN "id" DROP DEFAULT`);
    await queryInterface.dropTable("Category");
  },
};
