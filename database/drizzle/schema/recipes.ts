import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ── 食谱 ──
export const recipesTable = sqliteTable("recipes", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  description: text("description"), // 简介 (markdown)
  estimatedTime: integer("estimated_time"), // 预计用时（分钟）
  coverImage: text("cover_image"), // 封面图 URL
  video: text("video"), // 视频 URL
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Recipe = typeof recipesTable.$inferSelect;
export type RecipeInsert = typeof recipesTable.$inferInsert;

// ── 食谱图片集 ──
export const recipeImagesTable = sqliteTable("recipe_images", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipesTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type RecipeImage = typeof recipeImagesTable.$inferSelect;

// ── 食谱步骤 ──
export const recipeStepsTable = sqliteTable("recipe_steps", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipesTable.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  content: text("content").notNull(), // markdown 内容（文本 + 图片 + 视频）
});

export type RecipeStep = typeof recipeStepsTable.$inferSelect;
export type RecipeStepInsert = typeof recipeStepsTable.$inferInsert;
