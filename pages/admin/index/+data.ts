import type { PageContextServer } from "vike/types";

import * as comboQueries from "@/database/drizzle/queries/combos";
import * as ingredientQueries from "@/database/drizzle/queries/ingredients";
import * as recipeQueries from "@/database/drizzle/queries/recipes";
import * as tagQueries from "@/database/drizzle/queries/tags";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = (pageContext: PageContextServer) => {
  const db = pageContext.globalContext.db;
  const recipes = recipeQueries.getAllRecipes(db);
  const ingredients = ingredientQueries.getAllIngredients(db);
  const tags = tagQueries.getAllTags(db);
  const combos = comboQueries.getAllCombos(db);
  return { recipes, ingredients, tags, combos };
};
