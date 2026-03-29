import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ── 食材 ──
export const ingredientsTable = sqliteTable("ingredients", {
  id: text().primaryKey(), // UUID
  name: text().notNull().unique(),
  description: text(),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Ingredient = typeof ingredientsTable.$inferSelect;
export type IngredientInsert = typeof ingredientsTable.$inferInsert;
