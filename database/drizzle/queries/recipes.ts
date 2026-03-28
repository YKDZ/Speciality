import { eq, like, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import type { dbSqlite } from "@/database/drizzle/db";
import type { RecipeInsert } from "@/database/drizzle/schema/recipes";

import { ingredientsTable } from "@/database/drizzle/schema/ingredients";
import {
  recipeImagesTable,
  recipesTable,
  recipeStepsTable,
} from "@/database/drizzle/schema/recipes";
import {
  recipeIngredientsTable,
  recipeTagsTable,
  reviewsTable,
} from "@/database/drizzle/schema/relations";
import { tagsTable } from "@/database/drizzle/schema/tags";

type Db = ReturnType<typeof dbSqlite>;

// ── 食谱 CRUD ──

export const getAllRecipes = (db: Db) => db.select().from(recipesTable).all();

export const getRecipeById = (db: Db, id: string) =>
  db.select().from(recipesTable).where(eq(recipesTable.id, id)).get();

export const searchRecipes = (db: Db, query: string) => {
  const pattern = `%${query}%`;
  return db
    .select()
    .from(recipesTable)
    .where(
      or(
        like(recipesTable.name, pattern),
        like(recipesTable.description, pattern),
      ),
    )
    .all();
};

export const insertRecipe = (db: Db, recipe: Omit<RecipeInsert, "id">) => {
  const id = uuidv4();
  return db
    .insert(recipesTable)
    .values({ ...recipe, id })
    .returning()
    .get();
};

export const updateRecipe = (
  db: Db,
  id: string,
  data: Partial<Omit<RecipeInsert, "id">>,
) =>
  db
    .update(recipesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(recipesTable.id, id))
    .returning()
    .get();

export const deleteRecipe = (db: Db, id: string) =>
  db.delete(recipesTable).where(eq(recipesTable.id, id)).run();

// ── 食谱步骤 ──

export const getStepsByRecipeId = (db: Db, recipeId: string) =>
  db
    .select()
    .from(recipeStepsTable)
    .where(eq(recipeStepsTable.recipeId, recipeId))
    .orderBy(recipeStepsTable.sortOrder)
    .all();

export const upsertSteps = (
  db: Db,
  recipeId: string,
  steps: { content: string; sortOrder: number }[],
) => {
  // 删除旧步骤再插入新步骤
  db.delete(recipeStepsTable)
    .where(eq(recipeStepsTable.recipeId, recipeId))
    .run();
  if (steps.length === 0) return [];
  return db
    .insert(recipeStepsTable)
    .values(
      steps.map((s) => ({
        id: uuidv4(),
        recipeId,
        content: s.content,
        sortOrder: s.sortOrder,
      })),
    )
    .returning()
    .all();
};

// ── 食谱图片 ──

export const getImagesByRecipeId = (db: Db, recipeId: string) =>
  db
    .select()
    .from(recipeImagesTable)
    .where(eq(recipeImagesTable.recipeId, recipeId))
    .orderBy(recipeImagesTable.sortOrder)
    .all();

export const upsertImages = (
  db: Db,
  recipeId: string,
  images: { url: string; sortOrder: number }[],
) => {
  db.delete(recipeImagesTable)
    .where(eq(recipeImagesTable.recipeId, recipeId))
    .run();
  if (images.length === 0) return [];
  return db
    .insert(recipeImagesTable)
    .values(
      images.map((img) => ({
        id: uuidv4(),
        recipeId,
        url: img.url,
        sortOrder: img.sortOrder,
      })),
    )
    .returning()
    .all();
};

// ── 食谱-食材关联 ──

export const getIngredientsByRecipeId = (db: Db, recipeId: string) =>
  db
    .select({
      id: recipeIngredientsTable.id,
      ingredientId: recipeIngredientsTable.ingredientId,
      amount: recipeIngredientsTable.amount,
      note: recipeIngredientsTable.note,
      ingredientName: ingredientsTable.name,
      ingredientImage: ingredientsTable.image,
    })
    .from(recipeIngredientsTable)
    .innerJoin(
      ingredientsTable,
      eq(recipeIngredientsTable.ingredientId, ingredientsTable.id),
    )
    .where(eq(recipeIngredientsTable.recipeId, recipeId))
    .all();

export const upsertRecipeIngredients = (
  db: Db,
  recipeId: string,
  items: { ingredientId: string; amount?: string; note?: string }[],
) => {
  db.delete(recipeIngredientsTable)
    .where(eq(recipeIngredientsTable.recipeId, recipeId))
    .run();
  if (items.length === 0) return [];
  return db
    .insert(recipeIngredientsTable)
    .values(
      items.map((item) => ({
        id: uuidv4(),
        recipeId,
        ingredientId: item.ingredientId,
        amount: item.amount,
        note: item.note,
      })),
    )
    .returning()
    .all();
};

// ── 食谱-标签关联 ──

export const getTagsByRecipeId = (db: Db, recipeId: string) =>
  db
    .select({
      id: recipeTagsTable.id,
      tagId: recipeTagsTable.tagId,
      tagName: tagsTable.name,
    })
    .from(recipeTagsTable)
    .innerJoin(tagsTable, eq(recipeTagsTable.tagId, tagsTable.id))
    .where(eq(recipeTagsTable.recipeId, recipeId))
    .all();

export const upsertRecipeTags = (
  db: Db,
  recipeId: string,
  tagIds: string[],
) => {
  db.delete(recipeTagsTable)
    .where(eq(recipeTagsTable.recipeId, recipeId))
    .run();
  if (tagIds.length === 0) return [];
  return db
    .insert(recipeTagsTable)
    .values(
      tagIds.map((tagId) => ({
        id: uuidv4(),
        recipeId,
        tagId,
      })),
    )
    .returning()
    .all();
};

// ── 评价 ──

export const getReviewsByRecipeId = (db: Db, recipeId: string) =>
  db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.recipeId, recipeId))
    .orderBy(reviewsTable.createdAt)
    .all();

export const insertReview = (
  db: Db,
  review: {
    recipeId: string;
    author: string;
    rating: number;
    comment?: string;
  },
) => {
  const id = uuidv4();
  return db
    .insert(reviewsTable)
    .values({ ...review, id })
    .returning()
    .get();
};

export const deleteReview = (db: Db, id: string) =>
  db.delete(reviewsTable).where(eq(reviewsTable.id, id)).run();
