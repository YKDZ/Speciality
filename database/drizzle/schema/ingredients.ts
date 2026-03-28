import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ── 食材 ──
export const ingredientsTable = sqliteTable("ingredients", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull().unique(),
  description: text("description"),
  image: text("image"), // 图片 URL
  video: text("video"), // 视频 URL
  price: text("price"), // 价格（文本描述）
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Ingredient = typeof ingredientsTable.$inferSelect;
export type IngredientInsert = typeof ingredientsTable.$inferInsert;
