import { defineConfig } from "drizzle-kit";

const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("POSTGRES_URL or DATABASE_URL is required to run Drizzle commands");
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/postgres-migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
