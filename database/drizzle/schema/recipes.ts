import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ── 食谱 ──
export const recipesTable = sqliteTable("recipes", {
  id: text().primaryKey(), // UUID
  name: text().notNull(),
  description: text(), // 简介 (markdown)
  estimatedTime: integer(), // 预计用时（分钟）
  coverImage: text(), // 封面图 URL
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Recipe = typeof recipesTable.$inferSelect;
export type RecipeInsert = typeof recipesTable.$inferInsert;

// ── 食谱图片集 ──
export const recipeImagesTable = sqliteTable("recipe_images", {
  id: text().primaryKey(),
  recipeId: text()
    .notNull()
    .references(() => recipesTable.id, { onDelete: "cascade" }),
  url: text().notNull(),
  sortOrder: integer().notNull().default(0),
});

export type RecipeImage = typeof recipeImagesTable.$inferSelect;

// ── 食谱步骤 ──
export const recipeStepsTable = sqliteTable("recipe_steps", {
  id: text().primaryKey(),
  recipeId: text()
    .notNull()
    .references(() => recipesTable.id, { onDelete: "cascade" }),
  sortOrder: integer().notNull().default(0),
  name: text(), // 步骤可选名称
  content: text().notNull(), // markdown 内容
});

export type RecipeStep = typeof recipeStepsTable.$inferSelect;
export type RecipeStepInsert = typeof recipeStepsTable.$inferInsert;
