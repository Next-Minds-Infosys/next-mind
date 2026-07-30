"use strict";

/**
 * The "Next Minds" admin section: student billing and office expenses.
 *
 * Money is stored as INTEGER rupees, never a float - binary floating point
 * cannot represent decimal currency exactly and the rounding errors compound
 * across totals.
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

    await queryInterface.createTable("Invoice", {
      id,
      // Human-facing reference, e.g. NM-2026-0007. Unique so it can be quoted.
      invoiceNo: { type: Sequelize.TEXT, allowNull: false, unique: true },
      userId: {
        type: Sequelize.TEXT,
        allowNull: false,
        references: { model: "User", key: "id" },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },
      batchId: {
        type: Sequelize.TEXT,
        allowNull: true,
        references: { model: "Batch", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      description: { type: Sequelize.TEXT, allowNull: false },
      amount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      discount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      paidAmount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      status: { type: Sequelize.TEXT, allowNull: false, defaultValue: "UNPAID" },
      method: { type: Sequelize.TEXT, allowNull: true },
      issuedAt: { type: Sequelize.DATEONLY, allowNull: true },
      dueAt: { type: Sequelize.DATEONLY, allowNull: true },
      paidAt: { type: Sequelize.DATEONLY, allowNull: true },
      note: { type: Sequelize.TEXT, allowNull: true },
      createdById: {
        type: Sequelize.TEXT,
        allowNull: true,
        references: { model: "User", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      ...timestamps,
    });

    await queryInterface.createTable("Expense", {
      id,
      title: { type: Sequelize.TEXT, allowNull: false },
      category: { type: Sequelize.TEXT, allowNull: false, defaultValue: "Other" },
      amount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      vendor: { type: Sequelize.TEXT, allowNull: true },
      spentAt: { type: Sequelize.DATEONLY, allowNull: false },
      note: { type: Sequelize.TEXT, allowNull: true },
      // S3 key for a receipt scan, served through /api/media like every file.
      receiptKey: { type: Sequelize.TEXT, allowNull: true },
      receiptName: { type: Sequelize.TEXT, allowNull: true },
      createdById: {
        type: Sequelize.TEXT,
        allowNull: true,
        references: { model: "User", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      ...timestamps,
    });

    await queryInterface.addIndex("Invoice", ["userId"], { name: "Invoice_userId_idx" });
    await queryInterface.addIndex("Invoice", ["status"], { name: "Invoice_status_idx" });
    await queryInterface.addIndex("Invoice", ["issuedAt"], { name: "Invoice_issuedAt_idx" });
    await queryInterface.addIndex("Expense", ["spentAt"], { name: "Expense_spentAt_idx" });
    await queryInterface.addIndex("Expense", ["category"], { name: "Expense_category_idx" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Expense");
    await queryInterface.dropTable("Invoice");
  },
};
