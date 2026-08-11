import { cache } from "react";
import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins/admin";
import { adminAc } from "better-auth/plugins/admin/access";
import { nextCookies } from "better-auth/next-js";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import { cleanConnectionString, sslOptions } from "@/db/connection";

// Builds the pool at import time, so process.env must already be populated -
// a plain `tsx` script can't rely on Next having done it first.
loadEnvConfig(process.cwd());

const globalForPool = globalThis as unknown as { authPool?: Pool };

const rawUrl = process.env.DATABASE_URL ?? "";
const connectionString = cleanConnectionString(rawUrl);
const pgSsl = sslOptions(rawUrl);

// Same connection string as src/db/sequelize.ts - auth and the ORM must not
// point at different databases.
const pool =
  globalForPool.authPool ??
  new Pool({
    connectionString,
    // Same policy as src/db/sequelize.ts - see pgSsl above.
    ...(pgSsl ? { ssl: pgSsl } : {}),
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
  plugins: [
    // Only setUserPassword/revokeUserSessions are used (see resetUserPassword
    // in admin/users/actions.ts). Roles are remapped to our own role strings
    // ("ADMIN" etc) since the plugin's access control defaults to lowercase.
    admin({
      roles: { ADMIN: adminAc },
      adminRoles: ["ADMIN"],
      // Otherwise its create-user hook stamps new sign-ups with "user", which
      // isn't a valid Role enum value here.
      defaultRole: "STUDENT",
    }),
    // Must stay last - forwards auth.api.* Set-Cookie responses into Next's
    // cookie store, which a plain Response object never reaches.
    nextCookies(),
  ],
});

// Deduplicates within a single request - layout + page both need the
// session, and this avoids the duplicate DB-backed lookup.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
