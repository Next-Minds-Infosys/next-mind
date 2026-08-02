"use strict";

/**
 * Phase 2/3/4 tables: recorded lessons, downloadable materials, assignments,
 * submissions and batch messaging.
 *
 * Everything hangs off Batch, because Batch is the access boundary - a student
 * may read a row only if they hold an ACTIVE BatchStudent for its batchId.
 * Files are never stored here, only their S3 object key.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
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
    const batchRef = {
      type: Sequelize.TEXT,
      allowNull: false,
      references: { model: "Batch", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    };
    const userRef = (allowNull) => ({
      type: Sequelize.TEXT,
      allowNull,
      references: { model: "User", key: "id" },
      onDelete: allowNull ? "SET NULL" : "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.createTable("Lesson", {
      id,
      batchId: batchRef,
      title: { type: Sequelize.TEXT, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      orderIndex: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      // S3 object key. Never a public URL - playback is a presigned GET.
      videoKey: { type: Sequelize.TEXT, allowNull: true },
      videoMime: { type: Sequelize.TEXT, allowNull: true },
      videoSizeBytes: { type: Sequelize.BIGINT, allowNull: true },
      durationSeconds: { type: Sequelize.INTEGER, allowNull: true },
      published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdById: userRef(true),
      ...timestamps,
    });

    await queryInterface.createTable("Material", {
      id,
      batchId: batchRef,
      lessonId: {
        type: Sequelize.TEXT,
        allowNull: true,
        references: { model: "Lesson", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      title: { type: Sequelize.TEXT, allowNull: false },
      storageKey: { type: Sequelize.TEXT, allowNull: false },
      fileName: { type: Sequelize.TEXT, allowNull: false },
      mimeType: { type: Sequelize.TEXT, allowNull: true },
      sizeBytes: { type: Sequelize.BIGINT, allowNull: true },
      // Course notes are downloadable; recordings are not.
      downloadable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdById: userRef(true),
      ...timestamps,
    });

    await queryInterface.createTable("Assignment", {
      id,
      batchId: batchRef,
      title: { type: Sequelize.TEXT, allowNull: false },
      briefMd: { type: Sequelize.TEXT, allowNull: false, defaultValue: "" },
      attachmentKey: { type: Sequelize.TEXT, allowNull: true },
      attachmentName: { type: Sequelize.TEXT, allowNull: true },
      dueAt: { type: Sequelize.DATE, allowNull: true },
      maxScore: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 100 },
      published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdById: userRef(true),
      ...timestamps,
    });

    await queryInterface.createTable("Submission", {
      id,
      assignmentId: {
        type: Sequelize.TEXT,
        allowNull: false,
        references: { model: "Assignment", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      userId: userRef(false),
      storageKey: { type: Sequelize.TEXT, allowNull: true },
      fileName: { type: Sequelize.TEXT, allowNull: true },
      note: { type: Sequelize.TEXT, allowNull: true },
      submittedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      score: { type: Sequelize.INTEGER, allowNull: true },
      feedback: { type: Sequelize.TEXT, allowNull: true },
      gradedById: userRef(true),
      gradedAt: { type: Sequelize.DATE, allowNull: true },
      ...timestamps,
    });

    await queryInterface.createTable("Message", {
      id,
      batchId: batchRef,
      authorId: userRef(false),
      body: { type: Sequelize.TEXT, allowNull: false },
      // Self-reference: null = an instructor announcement, set = a reply.
      parentId: { type: Sequelize.TEXT, allowNull: true },
      ...timestamps,
    });
    await queryInterface.addConstraint("Message", {
      fields: ["parentId"],
      type: "foreign key",
      name: "Message_parentId_fkey",
      references: { table: "Message", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // One submission row per student per assignment; resubmitting updates it.
    await queryInterface.addConstraint("Submission", {
      fields: ["assignmentId", "userId"],
      type: "unique",
      name: "Submission_assignmentId_userId_key",
    });

    await queryInterface.addIndex("Lesson", ["batchId", "orderIndex"], {
      name: "Lesson_batchId_orderIndex_idx",
    });
    await queryInterface.addIndex("Material", ["batchId"], { name: "Material_batchId_idx" });
    await queryInterface.addIndex("Assignment", ["batchId"], { name: "Assignment_batchId_idx" });
    await queryInterface.addIndex("Submission", ["assignmentId"], {
      name: "Submission_assignmentId_idx",
    });
    await queryInterface.addIndex("Submission", ["userId"], { name: "Submission_userId_idx" });
    await queryInterface.addIndex("Message", ["batchId", "createdAt"], {
      name: "Message_batchId_createdAt_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Message");
    await queryInterface.dropTable("Submission");
    await queryInterface.dropTable("Assignment");
    await queryInterface.dropTable("Material");
    await queryInterface.dropTable("Lesson");
  },
};
