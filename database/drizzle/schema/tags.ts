import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ── 标签 ──
export const tagsTable = sqliteTable("tags", {
  id: text().primaryKey(), // UUID
  name: text().notNull().unique(),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Tag = typeof tagsTable.$inferSelect;
export type TagInsert = typeof tagsTable.$inferInsert;
