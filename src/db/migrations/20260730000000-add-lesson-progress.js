"use strict";

/**
 * Per-student, per-lesson completion. One row means "this student marked this
 * lesson done"; absence means not started. A unique pair keeps it idempotent so
 * a double click cannot inflate a completion percentage.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("LessonProgress", {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
      },
      lessonId: {
        type: Sequelize.TEXT,
        allowNull: false,
        references: { model: "Lesson", key: "id" },
        onDelete: "CASCADE",
      },
      userId: {
        type: Sequelize.TEXT,
        allowNull: false,
        references: { model: "User", key: "id" },
        onDelete: "CASCADE",
      },
      completedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
    });

    await queryInterface.addConstraint("LessonProgress", {
      fields: ["lessonId", "userId"],
      type: "unique",
      name: "LessonProgress_lessonId_userId_key",
    });
    await queryInterface.addIndex("LessonProgress", ["userId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("LessonProgress");
  },
};
