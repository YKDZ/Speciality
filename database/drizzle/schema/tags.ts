import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ── 标签 ──
export const tagsTable = sqliteTable("tags", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Tag = typeof tagsTable.$inferSelect;
export type TagInsert = typeof tagsTable.$inferInsert;
