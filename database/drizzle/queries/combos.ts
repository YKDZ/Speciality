import { eq, like, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import type { dbSqlite } from "@/database/drizzle/db";
import type { ComboInsert } from "@/database/drizzle/schema/combos";

import {
  comboRecipesTable,
  combosTable,
} from "@/database/drizzle/schema/combos";
import { ingredientsTable } from "@/database/drizzle/schema/ingredients";
import { recipesTable } from "@/database/drizzle/schema/recipes";
import {
  recipeIngredientsTable,
  recipeTagsTable,
} from "@/database/drizzle/schema/relations";
import { tagsTable } from "@/database/drizzle/schema/tags";

type Db = ReturnType<typeof dbSqlite>;

export const getAllCombos = (db: Db) => db.select().from(combosTable).all();

export const searchCombos = (db: Db, query: string) => {
  const pattern = `%${query}%`;
  return db
    .select()
    .from(combosTable)
    .where(
      or(
        like(combosTable.name, pattern),
        like(combosTable.description, pattern),
      ),
    )
    .all();
};

export const getComboById = (db: Db, id: string) =>
  db.select().from(combosTable).where(eq(combosTable.id, id)).get();

export const insertCombo = (db: Db, combo: Omit<ComboInsert, "id">) => {
  const id = uuidv4();
  return db
    .insert(combosTable)
    .values({ ...combo, id })
    .returning()
    .get();
};

export const updateCombo = (
  db: Db,
  id: string,
  data: Partial<Omit<ComboInsert, "id">>,
) =>
  db
    .update(combosTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(combosTable.id, id))
    .returning()
    .get();

export const deleteCombo = (db: Db, id: string) =>
  db.delete(combosTable).where(eq(combosTable.id, id)).run();

export const getRecipesByComboId = (db: Db, comboId: string) =>
  db
    .select({
      id: recipesTable.id,
      name: recipesTable.name,
      description: recipesTable.description,
      estimatedTime: recipesTable.estimatedTime,
      coverImage: recipesTable.coverImage,
      createdAt: recipesTable.createdAt,
      updatedAt: recipesTable.updatedAt,
      sortOrder: comboRecipesTable.sortOrder,
    })
    .from(comboRecipesTable)
    .innerJoin(recipesTable, eq(comboRecipesTable.recipeId, recipesTable.id))
    .where(eq(comboRecipesTable.comboId, comboId))
    .orderBy(comboRecipesTable.sortOrder)
    .all();

export const upsertComboRecipes = (
  db: Db,
  comboId: string,
  recipeIds: { recipeId: string; sortOrder: number }[],
) => {
  db.delete(comboRecipesTable)
    .where(eq(comboRecipesTable.comboId, comboId))
    .run();
  if (recipeIds.length === 0) return [];
  return db
    .insert(comboRecipesTable)
    .values(
      recipeIds.map((r) => ({
        id: uuidv4(),
        comboId,
        recipeId: r.recipeId,
        sortOrder: r.sortOrder,
      })),
    )
    .returning()
    .all();
};

export const getComboIngredients = (db: Db, comboId: string) => {
  const recipeRows = db
    .select({ recipeId: comboRecipesTable.recipeId })
    .from(comboRecipesTable)
    .where(eq(comboRecipesTable.comboId, comboId))
    .all();

  const recipeIds = recipeRows.map((r) => r.recipeId);
  if (recipeIds.length === 0) return [];

  return recipeIds.flatMap((recipeId) => {
    const recipe = db
      .select({ name: recipesTable.name })
      .from(recipesTable)
      .where(eq(recipesTable.id, recipeId))
      .get();

    const ings = db
      .select({
        id: recipeIngredientsTable.id,
        ingredientId: recipeIngredientsTable.ingredientId,
        quantity: recipeIngredientsTable.quantity,
        unit: recipeIngredientsTable.unit,
        note: recipeIngredientsTable.note,
        ingredientName: ingredientsTable.name,
      })
      .from(recipeIngredientsTable)
      .innerJoin(
        ingredientsTable,
        eq(recipeIngredientsTable.ingredientId, ingredientsTable.id),
      )
      .where(eq(recipeIngredientsTable.recipeId, recipeId))
      .all();

    return ings.map((ing) => ({
      ...ing,
      recipeName: recipe?.name ?? "",
      recipeId,
    }));
  });
};

export const getTagsByComboRecipes = (db: Db, comboId: string) => {
  const recipeRows = db
    .select({ recipeId: comboRecipesTable.recipeId })
    .from(comboRecipesTable)
    .where(eq(comboRecipesTable.comboId, comboId))
    .all();

  return recipeRows.flatMap(({ recipeId }) =>
    db
      .select({
        id: recipeTagsTable.id,
        tagId: recipeTagsTable.tagId,
        tagName: tagsTable.name,
        recipeId: recipeTagsTable.recipeId,
      })
      .from(recipeTagsTable)
      .innerJoin(tagsTable, eq(recipeTagsTable.tagId, tagsTable.id))
      .where(eq(recipeTagsTable.recipeId, recipeId))
      .all(),
  );
};
