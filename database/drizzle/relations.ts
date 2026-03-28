import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  // ── 食谱 (recipes) ──
  recipesTable: {
    steps: r.many.recipeStepsTable({
      from: r.recipesTable.id,
      to: r.recipeStepsTable.recipeId,
    }),
    images: r.many.recipeImagesTable({
      from: r.recipesTable.id,
      to: r.recipeImagesTable.recipeId,
    }),
    recipeIngredients: r.many.recipeIngredientsTable({
      from: r.recipesTable.id,
      to: r.recipeIngredientsTable.recipeId,
    }),
    recipeTags: r.many.recipeTagsTable({
      from: r.recipesTable.id,
      to: r.recipeTagsTable.recipeId,
    }),
    reviews: r.many.reviewsTable({
      from: r.recipesTable.id,
      to: r.reviewsTable.recipeId,
    }),
    // many-to-many through junction
    ingredients: r.many.ingredientsTable({
      from: r.recipesTable.id.through(r.recipeIngredientsTable.recipeId),
      to: r.ingredientsTable.id.through(r.recipeIngredientsTable.ingredientId),
    }),
    tags: r.many.tagsTable({
      from: r.recipesTable.id.through(r.recipeTagsTable.recipeId),
      to: r.tagsTable.id.through(r.recipeTagsTable.tagId),
    }),
  },

  // ── 食谱步骤 (recipe_steps) ──
  recipeStepsTable: {
    recipe: r.one.recipesTable({
      from: r.recipeStepsTable.recipeId,
      to: r.recipesTable.id,
    }),
  },

  // ── 食谱图片 (recipe_images) ──
  recipeImagesTable: {
    recipe: r.one.recipesTable({
      from: r.recipeImagesTable.recipeId,
      to: r.recipesTable.id,
    }),
  },

  // ── 食谱-食材关联 (junction) ──
  recipeIngredientsTable: {
    recipe: r.one.recipesTable({
      from: r.recipeIngredientsTable.recipeId,
      to: r.recipesTable.id,
    }),
    ingredient: r.one.ingredientsTable({
      from: r.recipeIngredientsTable.ingredientId,
      to: r.ingredientsTable.id,
    }),
  },

  // ── 食谱-标签关联 (junction) ──
  recipeTagsTable: {
    recipe: r.one.recipesTable({
      from: r.recipeTagsTable.recipeId,
      to: r.recipesTable.id,
    }),
    tag: r.one.tagsTable({
      from: r.recipeTagsTable.tagId,
      to: r.tagsTable.id,
    }),
  },

  // ── 评价 (reviews) ──
  reviewsTable: {
    recipe: r.one.recipesTable({
      from: r.reviewsTable.recipeId,
      to: r.recipesTable.id,
    }),
  },

  // ── 食材 (ingredients) ──
  ingredientsTable: {
    recipeIngredients: r.many.recipeIngredientsTable({
      from: r.ingredientsTable.id,
      to: r.recipeIngredientsTable.ingredientId,
    }),
  },

  // ── 标签 (tags) ──
  tagsTable: {
    recipeTags: r.many.recipeTagsTable({
      from: r.tagsTable.id,
      to: r.recipeTagsTable.tagId,
    }),
  },
}));
