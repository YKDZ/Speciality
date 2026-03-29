import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { ingredientsTable } from "./ingredients";
import { recipesTable } from "./recipes";
import { tagsTable } from "./tags";

// ── 食谱-食材关联 ──
export const recipeIngredientsTable = sqliteTable("recipe_ingredients", {
  id: text().primaryKey(),
  recipeId: text()
    .notNull()
    .references(() => recipesTable.id, { onDelete: "cascade" }),
  ingredientId: text()
    .notNull()
    .references(() => ingredientsTable.id, { onDelete: "cascade" }),
  quantity: text(), // 数量（数字字符串，也可为"少许"等描述）
  unit: text(), // 单位（如 "g", "ml", "个" 等）
  note: text(), // 备注
});

export type RecipeIngredient = typeof recipeIngredientsTable.$inferSelect;

// ── 食谱-标签关联 ──
export const recipeTagsTable = sqliteTable("recipe_tags", {
  id: text().primaryKey(),
  recipeId: text()
    .notNull()
    .references(() => recipesTable.id, { onDelete: "cascade" }),
  tagId: text()
    .notNull()
    .references(() => tagsTable.id, { onDelete: "cascade" }),
});

export type RecipeTag = typeof recipeTagsTable.$inferSelect;

// ── 评价 ──
export const reviewsTable = sqliteTable("reviews", {
  id: text().primaryKey(),
  recipeId: text()
    .notNull()
    .references(() => recipesTable.id, { onDelete: "cascade" }),
  author: text().notNull(), // 手动署名
  rating: integer().notNull(), // 1-5 星
  comment: text(),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Review = typeof reviewsTable.$inferSelect;
export type ReviewInsert = typeof reviewsTable.$inferInsert;
