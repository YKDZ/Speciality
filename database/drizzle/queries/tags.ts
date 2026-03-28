import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import type { dbSqlite } from "@/database/drizzle/db";

import { tagsTable } from "@/database/drizzle/schema/tags";

type Db = ReturnType<typeof dbSqlite>;

export const getAllTags = (db: Db) => db.select().from(tagsTable).all();

export const getTagById = (db: Db, id: string) =>
  db.select().from(tagsTable).where(eq(tagsTable.id, id)).get();

export const insertTag = (db: Db, name: string) => {
  const id = uuidv4();
  return db.insert(tagsTable).values({ id, name }).returning().get();
};

export const updateTag = (db: Db, id: string, name: string) =>
  db
    .update(tagsTable)
    .set({ name })
    .where(eq(tagsTable.id, id))
    .returning()
    .get();

export const deleteTag = (db: Db, id: string) =>
  db.delete(tagsTable).where(eq(tagsTable.id, id)).run();
