"use strict";

/**
 * Adds the structured content fields the course detail page renders, so a
 * course row can drive the page on its own instead of the static
 * src/data/v2-courses.json.
 *
 * Flat lists use TEXT[] to match the existing `tools` column; `curriculum` and
 * `faqs` are nested, so they use JSONB. `contentMd` is kept for free-form prose.
 *
 * `price` also moves TEXT -> INTEGER. Existing rows hold formatted strings such
 * as "NPR 45,000", so the cast strips non-digits rather than failing.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "Course",
        "shortDesc",
        { type: Sequelize.TEXT, allowNull: true },
        { transaction: t },
      );
      await queryInterface.addColumn(
        "Course",
        "whoIsItFor",
        { type: Sequelize.ARRAY(Sequelize.TEXT), allowNull: false, defaultValue: [] },
        { transaction: t },
      );
      await queryInterface.addColumn(
        "Course",
        "skills",
        { type: Sequelize.ARRAY(Sequelize.TEXT), allowNull: false, defaultValue: [] },
        { transaction: t },
      );
      await queryInterface.addColumn(
        "Course",
        "curriculum",
        { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
        { transaction: t },
      );
      await queryInterface.addColumn(
        "Course",
        "faqs",
        { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
        { transaction: t },
      );
      await queryInterface.addColumn(
        "Course",
        "badge",
        { type: Sequelize.TEXT, allowNull: true },
        { transaction: t },
      );
      await queryInterface.addColumn(
        "Course",
        "color",
        { type: Sequelize.TEXT, allowNull: true },
        { transaction: t },
      );
      await queryInterface.addColumn(
        "Course",
        "students",
        { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        { transaction: t },
      );

      // changeColumn cannot emit a USING clause, so do the cast in raw SQL.
      // NULLIF guards rows whose price has no digits at all.
      await queryInterface.sequelize.query(
        `ALTER TABLE "Course"
           ALTER COLUMN "price" TYPE INTEGER
           USING COALESCE(NULLIF(regexp_replace("price", '[^0-9]', '', 'g'), '')::integer, 0)`,
        { transaction: t },
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "Course" ALTER COLUMN "price" SET DEFAULT 0`,
        { transaction: t },
      );

      // The public listing filters on both of these.
      await queryInterface.addIndex("Course", ["published"], {
        name: "Course_published_idx",
        transaction: t,
      });
      await queryInterface.addIndex("Course", ["categoryId"], {
        name: "Course_categoryId_idx",
        transaction: t,
      });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeIndex("Course", "Course_categoryId_idx", { transaction: t });
      await queryInterface.removeIndex("Course", "Course_published_idx", { transaction: t });

      await queryInterface.sequelize.query(
        `ALTER TABLE "Course" ALTER COLUMN "price" DROP DEFAULT`,
        { transaction: t },
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "Course" ALTER COLUMN "price" TYPE TEXT USING "price"::text`,
        { transaction: t },
      );

      for (const column of [
        "students",
        "color",
        "badge",
        "faqs",
        "curriculum",
        "skills",
        "whoIsItFor",
        "shortDesc",
      ]) {
        await queryInterface.removeColumn("Course", column, { transaction: t });
      }

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
};
