"use strict";

/**
 * Phase 1 of the LMS expansion (.planning/lms-expansion-plan.md).
 *
 * Batch is the unit instructors and students actually work against - Enrollment is
 * a lead from the public form, not a membership, so it cannot serve this role.
 * BatchStudent is the join that every instructor/student query scopes against.
 *
 * Post moves the blog off the static src/data/blog.json.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    const id = {
      type: Sequelize.TEXT,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.literal("gen_random_uuid()::text"),
    };
    const timestamps = {
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    };

    await queryInterface.createTable("Batch", {
      id,
      // One course per batch (settled decision).
      courseId: {
        type: Sequelize.TEXT,
        allowNull: false,
        references: { model: "Course", key: "id" },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },
      // Nullable so a batch can be created before its instructor is decided.
      instructorId: {
        type: Sequelize.TEXT,
        allowNull: true,
        references: { model: "User", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      name: { type: Sequelize.TEXT, allowNull: false },
      code: { type: Sequelize.TEXT, allowNull: false, unique: true },
      startDate: { type: Sequelize.DATEONLY, allowNull: true },
      endDate: { type: Sequelize.DATEONLY, allowNull: true },
      schedule: { type: Sequelize.TEXT, allowNull: true },
      mode: { type: Sequelize.TEXT, allowNull: false, defaultValue: "Physical" },
      capacity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      status: { type: Sequelize.TEXT, allowNull: false, defaultValue: "UPCOMING" },
      ...timestamps,
    });

    await queryInterface.createTable("BatchStudent", {
      id,
      batchId: {
        type: Sequelize.TEXT,
        allowNull: false,
        references: { model: "Batch", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      userId: {
        type: Sequelize.TEXT,
        allowNull: false,
        references: { model: "User", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      status: { type: Sequelize.TEXT, allowNull: false, defaultValue: "ACTIVE" },
      enrolledAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      ...timestamps,
    });

    await queryInterface.createTable("Post", {
      id,
      slug: { type: Sequelize.TEXT, allowNull: false, unique: true },
      title: { type: Sequelize.TEXT, allowNull: false },
      excerpt: { type: Sequelize.TEXT, allowNull: true },
      contentMd: { type: Sequelize.TEXT, allowNull: false, defaultValue: "" },
      category: { type: Sequelize.TEXT, allowNull: true },
      emoji: { type: Sequelize.TEXT, allowNull: true },
      coverKey: { type: Sequelize.TEXT, allowNull: true },
      readTime: { type: Sequelize.TEXT, allowNull: true },
      authorName: { type: Sequelize.TEXT, allowNull: true },
      authorId: {
        type: Sequelize.TEXT,
        allowNull: true,
        references: { model: "User", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      featured: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      publishedAt: { type: Sequelize.DATE, allowNull: true },
      ...timestamps,
    });

    // A student must not be in the same batch twice - this is the integrity rule
    // behind every "is this user allowed to see this batch" check.
    await queryInterface.addConstraint("BatchStudent", {
      fields: ["batchId", "userId"],
      type: "unique",
      name: "BatchStudent_batchId_userId_key",
    });

    await queryInterface.addIndex("Batch", ["courseId"], { name: "Batch_courseId_idx" });
    await queryInterface.addIndex("Batch", ["instructorId"], { name: "Batch_instructorId_idx" });
    await queryInterface.addIndex("Batch", ["status"], { name: "Batch_status_idx" });
    // The hot path: "which batches does this student belong to".
    await queryInterface.addIndex("BatchStudent", ["userId"], {
      name: "BatchStudent_userId_idx",
    });
    await queryInterface.addIndex("Post", ["published", "publishedAt"], {
      name: "Post_published_publishedAt_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Post");
    await queryInterface.dropTable("BatchStudent");
    await queryInterface.dropTable("Batch");
  },
};
