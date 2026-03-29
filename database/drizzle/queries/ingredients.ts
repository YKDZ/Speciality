import { eq, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import type { dbSqlite } from "@/database/drizzle/db";
import type { IngredientInsert } from "@/database/drizzle/schema/ingredients";

import { ingredientsTable } from "@/database/drizzle/schema/ingredients";

type Db = ReturnType<typeof dbSqlite>;

export const getAllIngredients = (db: Db) =>
  db.select().from(ingredientsTable).all();

export const getIngredientById = (db: Db, id: string) =>
  db.select().from(ingredientsTable).where(eq(ingredientsTable.id, id)).get();

export const searchIngredients = (db: Db, query: string) =>
  db
    .select()
    .from(ingredientsTable)
    .where(like(ingredientsTable.name, `%${query}%`))
    .all();

export const insertIngredient = (
  db: Db,
  ingredient: Omit<IngredientInsert, "id">,
) => {
  const id = uuidv4();
  return db
    .insert(ingredientsTable)
    .values({ ...ingredient, id })
    .returning()
    .get();
};

export const updateIngredient = (
  db: Db,
  id: string,
  data: Partial<Omit<IngredientInsert, "id">>,
) =>
  db
    .update(ingredientsTable)
    .set(data)
    .where(eq(ingredientsTable.id, id))
    .returning()
    .get();

export const deleteIngredient = (db: Db, id: string) =>
  db.delete(ingredientsTable).where(eq(ingredientsTable.id, id)).run();
