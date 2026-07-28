import { Sequelize } from "sequelize";
import pg from 'pg';
import { loadEnvConfig } from "@next/env"

// Load environment variables from the root .env file
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

// The models call `Model.init({ sequelize })` at module scope, so `next build`
// constructs this while collecting route metadata - before any request env is
// available. Passing `undefined` there throws ERR_INVALID_ARG_TYPE and fails
// the build on any machine without DATABASE_URL (CI included).
//
// Sequelize does not open a connection in its constructor, so falling back to
// a placeholder keeps the build working while any real query still fails
// loudly at runtime if the variable was never configured.
if (!databaseUrl) {
  console.warn(
    "[db] DATABASE_URL is not set - using a placeholder connection string. " +
      "Database queries will fail until it is configured (see .env.example)."
  );
}

const connectionString =
  databaseUrl ?? "postgres://nextmind_user:nextmind_db@127.0.0.1:5432/placeholder";

const globalForSequelize = globalThis as unknown as { sequelize?: Sequelize };

export const sequelize =
  globalForSequelize.sequelize ??
  new Sequelize(connectionString, {
    dialect: "postgres",
    dialectModule: pg,
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    define: {
      freezeTableName: true,
      underscored: false,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForSequelize.sequelize = sequelize;
}
