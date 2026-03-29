import type { PageContextServer } from "vike/types";

import * as recipeQueries from "@/database/drizzle/queries/recipes";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = (pageContext: PageContextServer) => {
  const db = pageContext.globalContext.db;
  const allRecipes = recipeQueries.getAllRecipes(db);
  return { allRecipes };
};
