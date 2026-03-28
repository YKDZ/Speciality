import { getContext } from "telefunc";
import { z } from "zod/v4";

import * as recipeQueries from "@/database/drizzle/queries/recipes";

const recipeSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  estimatedTime: z.number().int().positive().optional(),
  coverImage: z.url().optional(),
  video: z.url().optional(),
});

const stepSchema = z.object({
  content: z.string().min(1),
  sortOrder: z.number().int().min(0),
});

const imageSchema = z.object({
  url: z.url(),
  sortOrder: z.number().int().min(0),
});

const ingredientRelSchema = z.object({
  ingredientId: z.string().uuid(),
  amount: z.string().optional(),
  note: z.string().optional(),
});

const reviewSchema = z.object({
  recipeId: z.string().uuid(),
  author: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// ── 查询 ──

export const onGetAllRecipes = async () => {
  const { db } = getContext<Vike.PageContextServer>();
  return recipeQueries.getAllRecipes(db);
};

export const onGetRecipeById = async (id: string) => {
  const { db } = getContext<Vike.PageContextServer>();
  const recipe = recipeQueries.getRecipeById(db, id);
  if (!recipe) return null;
  const steps = recipeQueries.getStepsByRecipeId(db, id);
  const images = recipeQueries.getImagesByRecipeId(db, id);
  const ingredients = recipeQueries.getIngredientsByRecipeId(db, id);
  const tags = recipeQueries.getTagsByRecipeId(db, id);
  const reviews = recipeQueries.getReviewsByRecipeId(db, id);
  return { ...recipe, steps, images, ingredients, tags, reviews };
};

export const onSearchRecipes = async (query: string) => {
  const { db } = getContext<Vike.PageContextServer>();
  return recipeQueries.searchRecipes(db, query);
};

// ── 创建 ──

export const onCreateRecipe = async (input: z.input<typeof recipeSchema>) => {
  const parsed = recipeSchema.parse(input);
  const { db } = getContext<Vike.PageContextServer>();
  return recipeQueries.insertRecipe(db, parsed);
};

// ── 更新 ──

export const onUpdateRecipe = async (
  id: string,
  input: Partial<z.input<typeof recipeSchema>>,
) => {
  const parsed = recipeSchema.partial().parse(input);
  const { db } = getContext<Vike.PageContextServer>();
  return recipeQueries.updateRecipe(db, id, parsed);
};

// ── 删除 ──

export const onDeleteRecipe = async (id: string) => {
  const { db } = getContext<Vike.PageContextServer>();
  return recipeQueries.deleteRecipe(db, id);
};

// ── 步骤 ──

export const onUpsertSteps = async (
  recipeId: string,
  steps: z.input<typeof stepSchema>[],
) => {
  const parsed = z.array(stepSchema).parse(steps);
  const { db } = getContext<Vike.PageContextServer>();
  return recipeQueries.upsertSteps(db, recipeId, parsed);
};

// ── 图片 ──

export const onUpsertImages = async (
  recipeId: string,
  images: z.input<typeof imageSchema>[],
) => {
  const parsed = z.array(imageSchema).parse(images);
  const { db } = getContext<Vike.PageContextServer>();
  return recipeQueries.upsertImages(db, recipeId, parsed);
};

// ── 食谱-食材关联 ──

export const onUpsertRecipeIngredients = async (
  recipeId: string,
  items: z.input<typeof ingredientRelSchema>[],
) => {
  const parsed = z.array(ingredientRelSchema).parse(items);
  const { db } = getContext<Vike.PageContextServer>();
  return recipeQueries.upsertRecipeIngredients(db, recipeId, parsed);
};

// ── 食谱-标签关联 ──

export const onUpsertRecipeTags = async (
  recipeId: string,
  tagIds: string[],
) => {
  const parsed = z.array(z.string().uuid()).parse(tagIds);
  const { db } = getContext<Vike.PageContextServer>();
  return recipeQueries.upsertRecipeTags(db, recipeId, parsed);
};

// ── 评价 ──

export const onCreateReview = async (input: z.input<typeof reviewSchema>) => {
  const parsed = reviewSchema.parse(input);
  const { db } = getContext<Vike.PageContextServer>();
  return recipeQueries.insertReview(db, parsed);
};

export const onDeleteReview = async (id: string) => {
  const { db } = getContext<Vike.PageContextServer>();
  return recipeQueries.deleteReview(db, id);
};

export const onGetReviewsByRecipeId = async (recipeId: string) => {
  const { db } = getContext<Vike.PageContextServer>();
  return recipeQueries.getReviewsByRecipeId(db, recipeId);
};
