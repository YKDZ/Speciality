import { getContext } from "telefunc";

import * as recipeQueries from "@/database/drizzle/queries/recipes";

export const onDeleteRecipe = async (id: string) => {
  const { db } = getContext<Vike.GlobalContextServer>();
  return recipeQueries.deleteRecipe(db, id);
};
