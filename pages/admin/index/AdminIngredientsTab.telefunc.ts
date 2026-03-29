import { getContext } from "telefunc";
import { z } from "zod/v4";

import * as ingredientQueries from "@/database/drizzle/queries/ingredients";

const ingredientSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
});

export const onGetAllIngredients = async () => {
  const { db } = getContext<Vike.GlobalContextServer>();
  return ingredientQueries.getAllIngredients(db);
};

export const onSearchIngredients = async (query: string) => {
  const { db } = getContext<Vike.GlobalContextServer>();
  return ingredientQueries.searchIngredients(db, query);
};

export const onCreateIngredient = async (
  input: z.input<typeof ingredientSchema>,
) => {
  const parsed = ingredientSchema.parse(input);
  const { db } = getContext<Vike.GlobalContextServer>();
  return ingredientQueries.insertIngredient(db, parsed);
};

export const onUpdateIngredient = async (
  id: string,
  input: Partial<z.input<typeof ingredientSchema>>,
) => {
  const parsed = ingredientSchema.partial().parse(input);
  const { db } = getContext<Vike.GlobalContextServer>();
  return ingredientQueries.updateIngredient(db, id, parsed);
};

export const onDeleteIngredient = async (id: string) => {
  const { db } = getContext<Vike.GlobalContextServer>();
  return ingredientQueries.deleteIngredient(db, id);
};
