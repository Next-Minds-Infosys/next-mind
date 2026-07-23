/**
 * Ensures schema exists for a fresh database.
 * Safe on an existing Prisma-migrated DB (does not alter columns).
 */


import { readFileSync } from "fs";
import { join } from "path";
import { sequelize } from "./sequelize";

async function main() {
  await sequelize.authenticate();
  console.log("Connected to database");

  // Prefer running the Prisma-compatible SQL schema if tables are missing
  const [tables] = (await sequelize.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User'`
  )) as [{ tablename: string }[], unknown];

  if (tables.length === 0) {
    const sqlPath = join(process.cwd(), "src/db/schema.sql");
    const sql = readFileSync(sqlPath, "utf8");
    await sequelize.query(sql);
    console.log("Applied src/db/schema.sql");
  } else {
    console.log("Schema already present — skipping create");
  }

  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});