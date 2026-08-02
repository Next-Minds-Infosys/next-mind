"use strict";

/**
 * DB-backed RBAC: Policy holds a JSONB resource->actions map, RolePolicy attaches
 * one to a role. Seeds full-access->ADMIN and content-and-leads->EDITOR.
 * @type {import('sequelize-cli').Migration}
 */

// Mirrors RESOURCES/ACTIONS in src/lib/policies.ts - migrations are
// self-contained and don't import app source, so the list is duplicated here.
const ALL_RESOURCES = [
  "dashboard",
  "categories",
  "courses",
  "batches",
  "mentors",
  "users",
  "billing",
  "expenses",
  "blog",
  "enrollments",
  "contacts",
  "enterpriseInquiries",
  "policies",
];
const ALL_ACTIONS = ["read", "create", "update", "delete"];

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

    await queryInterface.createTable("Policy", {
      id,
      name: { type: Sequelize.TEXT, allowNull: false, unique: true },
      label: { type: Sequelize.TEXT, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      permissions: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
      ...timestamps,
    });

    await queryInterface.createTable("RolePolicy", {
      id,
      role: { type: Sequelize.TEXT, allowNull: false },
      policyId: {
        type: Sequelize.TEXT,
        allowNull: false,
        references: { model: "Policy", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      ...timestamps,
    });

    await queryInterface.addConstraint("RolePolicy", {
      fields: ["role", "policyId"],
      type: "unique",
      name: "RolePolicy_role_policyId_key",
    });
    await queryInterface.addIndex("RolePolicy", ["role"], { name: "RolePolicy_role_idx" });

    const fullAccessPermissions = Object.fromEntries(
      ALL_RESOURCES.map((resource) => [resource, ALL_ACTIONS]),
    );
    const contentAndLeadsPermissions = {
      blog: ["read", "create", "update", "delete"],
      enrollments: ["read", "update"],
      contacts: ["read", "update"],
      enterpriseInquiries: ["read", "update"],
    };

    // Ids generated here (rather than relying on bulkInsert to hand back
    // Postgres-generated defaults, which sequelize-cli does not reliably
    // return across dialects/versions) so RolePolicy can reference them below.
    const fullAccessId = crypto.randomUUID();
    const contentAndLeadsId = crypto.randomUUID();
    const now = new Date();

    await queryInterface.bulkInsert("Policy", [
      {
        id: fullAccessId,
        name: "full-access",
        label: "Full access",
        description: "Every resource and action - the built-in Admin policy.",
        permissions: JSON.stringify(fullAccessPermissions),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: contentAndLeadsId,
        name: "content-and-leads",
        label: "Content & leads",
        description:
          "Blog (full) plus read/update on Enrollments, Contacts and Enterprise Inquiries.",
        permissions: JSON.stringify(contentAndLeadsPermissions),
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert("RolePolicy", [
      {
        id: crypto.randomUUID(),
        role: "ADMIN",
        policyId: fullAccessId,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        role: "EDITOR",
        policyId: contentAndLeadsId,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("RolePolicy");
    await queryInterface.dropTable("Policy");
  },
};
