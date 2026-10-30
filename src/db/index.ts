import { drizzle } from "drizzle-orm/node-sqlite";

const dbFile =
  process.env.DB_FILE_NAME ||
  process.env.DATABASE_URL?.replace(/^file:/, "") ||
  "dev.db";

export const db = drizzle(dbFile);
