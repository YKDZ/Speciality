import { getContext } from "telefunc";
import { z } from "zod/v4";

import * as recipeQueries from "@/database/drizzle/queries/recipes";

const recipeSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  estimatedTime: z.int().positive().optional(),
  coverImage: z.string().optional(),
});

const stepSchema = z.object({
  content: z.string().min(1),
  sortOrder: z.int().min(0),
  name: z.string().optional(),
});

const ingredientRelSchema = z.object({
  ingredientId: z.uuid(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  note: z.string().optional(),
});

export const onUpdateRecipe = async (
  id: string,
  input: Partial<z.input<typeof recipeSchema>>,
) => {
  const parsed = recipeSchema.partial().parse(input);
  const { db } = getContext<Vike.GlobalContextServer>();
  return recipeQueries.updateRecipe(db, id, parsed);
};

export const onDeleteRecipe = async (id: string) => {
  const { db } = getContext<Vike.GlobalContextServer>();
  return recipeQueries.deleteRecipe(db, id);
};

export const onUpsertSteps = async (
  recipeId: string,
  steps: z.input<typeof stepSchema>[],
) => {
  const parsed = z.array(stepSchema).parse(steps);
  const { db } = getContext<Vike.GlobalContextServer>();
  return recipeQueries.upsertSteps(db, recipeId, parsed);
};

export const onUpsertRecipeTags = async (
  recipeId: string,
  tagIds: string[],
) => {
  const parsed = z.array(z.uuid()).parse(tagIds);
  const { db } = getContext<Vike.GlobalContextServer>();
  return recipeQueries.upsertRecipeTags(db, recipeId, parsed);
};

export const onUpsertRecipeIngredients = async (
  recipeId: string,
  items: z.input<typeof ingredientRelSchema>[],
) => {
  const parsed = z.array(ingredientRelSchema).parse(items);
  const { db } = getContext<Vike.GlobalContextServer>();
  return recipeQueries.upsertRecipeIngredients(db, recipeId, parsed);
};
