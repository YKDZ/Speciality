import type { PageContextServer } from "vike/types";

import * as ingredientQueries from "@/database/drizzle/queries/ingredients";
import * as recipeQueries from "@/database/drizzle/queries/recipes";
import * as tagQueries from "@/database/drizzle/queries/tags";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = (pageContext: PageContextServer) => {
  const recipes = recipeQueries.getAllRecipes(pageContext.db);
  const ingredients = ingredientQueries.getAllIngredients(pageContext.db);
  const tags = tagQueries.getAllTags(pageContext.db);
  return { recipes, ingredients, tags };
};
