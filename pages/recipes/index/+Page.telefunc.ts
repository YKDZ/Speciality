import { getContext } from "telefunc";

import * as recipeQueries from "@/database/drizzle/queries/recipes";

export const onSearchRecipes = async (query: string) => {
  const { db } = getContext<Vike.GlobalContextServer>();
  return recipeQueries.searchRecipes(db, query);
};
