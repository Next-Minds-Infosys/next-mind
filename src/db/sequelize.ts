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
  // `next build` still has to evaluate this module to collect route metadata,
  // so the build is allowed to proceed on the placeholder below. A running
  // production server is different: every page here is dynamic and queries the
  // database, so a missing URL means every request fails. Fail loudly at boot
  // with a message you can actually read, instead of letting React swallow a
  // connection error into "the specific message is omitted in production".
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

  if (process.env.NODE_ENV === "production" && !isBuildPhase) {
    throw new Error(
      "DATABASE_URL is not set. Point it at a database this deployment can " +
        "actually reach - a localhost URL works locally but never from a " +
        "hosted environment such as Vercel. See .env.example."
    );
  }

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
    // Sequelize parses the URL itself and drops `?sslmode=`, so hosted
    // Postgres (Neon, Supabase, RDS) must be told to use SSL explicitly or it
    // rejects the connection as insecure. Local sockets stay plaintext.
    ...(/(localhost|127\.0\.0\.1)/.test(connectionString)
      ? {}
      : {
          dialectOptions: {
            ssl: process.env.DATABASE_CA_CERT
              ? { require: true, ca: process.env.DATABASE_CA_CERT, rejectUnauthorized: true }
              : { require: true, rejectUnauthorized: false },
          },
        }),
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    define: {
      freezeTableName: true,
      underscored: false,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForSequelize.sequelize = sequelize;
}
