import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { recipesTable } from "./recipes";

// ── 搭配 ──
export const combosTable = sqliteTable("combos", {
  id: text().primaryKey(),
  name: text().notNull(),
  description: text(),
  estimatedTime: integer(), // 手动指定的总时长（分钟），null 则自动相加
  coverImage: text(),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Combo = typeof combosTable.$inferSelect;
export type ComboInsert = typeof combosTable.$inferInsert;

// ── 搭配-食谱关联 ──
export const comboRecipesTable = sqliteTable("combo_recipes", {
  id: text().primaryKey(),
  comboId: text()
    .notNull()
    .references(() => combosTable.id, { onDelete: "cascade" }),
  recipeId: text()
    .notNull()
    .references(() => recipesTable.id, { onDelete: "cascade" }),
  sortOrder: integer().notNull().default(0),
});

export type ComboRecipe = typeof comboRecipesTable.$inferSelect;
