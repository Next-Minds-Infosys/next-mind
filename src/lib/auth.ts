import { betterAuth } from "better-auth";
import { Pool } from "pg";

const globalForPool = globalThis as unknown as { authPool?: Pool };

const pool =
  globalForPool.authPool ??
  new Pool({
    connectionString: "postgresql://nextmind:nextmind@127.0.0.1:5432/nextminds",
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
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    },
  },
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
});
