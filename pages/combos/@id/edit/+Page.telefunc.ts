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

export const onUpdateCombo = async (
  id: string,
  input: {
    name?: string;
    description?: string;
    estimatedTime?: number | null;
    coverImage?: string;
  },
) => {
  const { db } = getContext<Vike.GlobalContextServer>();
  z.uuid().parse(id);
  const data = comboSchema.partial().parse(input);
  return comboQueries.updateCombo(db, id, data);
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
