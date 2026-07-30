import { cache } from "react";
import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

// This module builds its pool at import time, so it cannot rely on something
// else having populated process.env first. Next does it for the app, but a
// plain `tsx` script only gets it because src/db/sequelize.ts happens to be
// imported earlier - and that ordering is not something to depend on.
loadEnvConfig(process.cwd());

const globalForPool = globalThis as unknown as { authPool?: Pool };

const connectionString = process.env.DATABASE_URL;
const isLocal = /(localhost|127\.0\.0\.1)/.test(connectionString ?? "");

// Same connection string as src/db/sequelize.ts - auth and the ORM must not
// point at different databases.
const pool =
  globalForPool.authPool ??
  new Pool({
    connectionString,
    // Matches the dialectOptions in src/db/sequelize.ts. Managed Postgres
    // (Neon, RDS) refuses an unencrypted connection, and their certificates are
    // not in Node's default trust store.
    ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPool.authPool = pool;
}

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID ?? "",
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  //   },
  // },
  // Map to existing Prisma PascalCase tables
  user: {
    modelName: "User",
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        input: false,
      },
    },
  },
  session: {
    modelName: "Session",
  },
  account: {
    modelName: "Account",
  },
  verification: {
    modelName: "Verification",
  },
  // Must stay last. When a server action calls auth.api.*, better-auth returns
  // its Set-Cookie on a Response object that never reaches the browser. This
  // plugin writes those cookies into Next's cookie store instead. Without it,
  // changePassword({ revokeOtherSessions: true }) rotates the session server-
  // side and the browser is left holding a token that no longer exists.
  plugins: [nextCookies()],
});

// Deduplicates within a single request - layout + page both need the
// session, and this avoids the duplicate DB-backed lookup.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
