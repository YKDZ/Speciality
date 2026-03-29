import { getContext } from "telefunc";
import { z } from "zod";

import * as comboQueries from "@/database/drizzle/queries/combos";

const comboSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  estimatedTime: z.int().positive().optional(),
  coverImage: z.string().optional(),
});

const comboRecipeSchema = z.array(
  z.object({ recipeId: z.uuid(), sortOrder: z.int() }),
);

export const onCreateCombo = async (input: {
  name: string;
  description?: string;
  estimatedTime?: number;
  coverImage?: string;
}) => {
  const { db } = getContext<Vike.GlobalContextServer>();
  const data = comboSchema.parse(input);
  return comboQueries.insertCombo(db, data);
};

export const onUpsertComboRecipes = async (
  comboId: string,
  recipes: { recipeId: string; sortOrder: number }[],
) => {
  const { db } = getContext<Vike.GlobalContextServer>();
  z.uuid().parse(comboId);
  comboRecipeSchema.parse(recipes);
  return comboQueries.upsertComboRecipes(db, comboId, recipes);
};
