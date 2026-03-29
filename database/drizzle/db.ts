import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";

import { relations } from "./relations";

export const dbSqlite = () => {
  const sqlite = new Database(process.env.DATABASE_URL);
  sqlite.pragma("foreign_keys = ON");
  return drizzleSqlite({ client: sqlite, relations, casing: "snake_case" });
};
