import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { ingredientsTable } from "./ingredients";
import { recipesTable } from "./recipes";
import { tagsTable } from "./tags";

// ── 食谱-食材关联 ──
export const recipeIngredientsTable = sqliteTable("recipe_ingredients", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipesTable.id, { onDelete: "cascade" }),
  ingredientId: text("ingredient_id")
    .notNull()
    .references(() => ingredientsTable.id, { onDelete: "cascade" }),
  amount: text("amount"), // 用量描述，如 "200g"
  note: text("note"), // 备注
});

export type RecipeIngredient = typeof recipeIngredientsTable.$inferSelect;

// ── 食谱-标签关联 ──
export const recipeTagsTable = sqliteTable("recipe_tags", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipesTable.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tagsTable.id, { onDelete: "cascade" }),
});

export type RecipeTag = typeof recipeTagsTable.$inferSelect;

// ── 评价 ──
export const reviewsTable = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipesTable.id, { onDelete: "cascade" }),
  author: text("author").notNull(), // 手动署名
  rating: integer("rating").notNull(), // 1-5 星
  comment: text("comment"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Review = typeof reviewsTable.$inferSelect;
export type ReviewInsert = typeof reviewsTable.$inferInsert;
