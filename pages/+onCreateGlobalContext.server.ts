import type { GlobalContextServer } from "vike/types";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { relations } from "@/database/drizzle/relations";
import { seed } from "@/database/seed";

const prepareDB = () => {
  const sqlite = new Database(process.env.DATABASE_URL);
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle({ client: sqlite, relations, casing: "snake_case" });
  migrate(db, { migrationsFolder: "./database/migrations" });

  console.log("DB migrations applied successfully");

  seed(db);

  return db;
};

export const onCreateGlobalContext = (globalContext: GlobalContextServer) => {
  globalContext.db = prepareDB();
  globalContext.title = process.env.TITLE || "HRecipe";
  globalContext.reviewsEnabled = process.env.REVIEWS_ENABLED !== "false";
  globalContext.hideLanguageSwitcher =
    process.env.HIDE_LANGUAGE_SWITCHER === "true";
  globalContext.forceFallbackLocale =
    process.env.FORCE_FALLBACK_LOCALE === "true";
};
