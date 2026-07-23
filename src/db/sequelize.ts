import { Sequelize } from "sequelize";
import pg from 'pg';
import { loadEnvConfig } from "@next/env"

// Load environment variables from the root .env file
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;


const globalForSequelize = globalThis as unknown as { sequelize?: Sequelize };

export const sequelize =
  globalForSequelize.sequelize ??
  new Sequelize(databaseUrl!, {
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
