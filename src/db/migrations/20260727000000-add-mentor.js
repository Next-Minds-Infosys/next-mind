"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await queryInterface.createTable("Mentor", {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal("gen_random_uuid()::text"),
      },
      name: { type: Sequelize.TEXT, allowNull: false },
      role: { type: Sequelize.TEXT, allowNull: false },
      bio: { type: Sequelize.TEXT, allowNull: false },
      photo: { type: Sequelize.TEXT, allowNull: true },
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
    });

    await queryInterface.addColumn("Course", "mentorId", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addConstraint("Course", {
      fields: ["mentorId"],
      type: "foreign key",
      name: "Course_mentorId_fkey",
      references: { table: "Mentor", field: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("Course", "Course_mentorId_fkey");
    await queryInterface.removeColumn("Course", "mentorId");
    await queryInterface.dropTable("Mentor");
  },
};
