import type { PageContextServer } from "vike/types";

import * as recipeQueries from "@/database/drizzle/queries/recipes";
import * as tagQueries from "@/database/drizzle/queries/tags";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = (pageContext: PageContextServer) => {
  const recipes = recipeQueries.getAllRecipes(pageContext.db);
  const tags = tagQueries.getAllTags(pageContext.db);

  // Enrich recipes with tags
  const recipesWithTags = recipes.map((recipe) => {
    const recipeTags = recipeQueries.getTagsByRecipeId(
      pageContext.db,
      recipe.id,
    );
    return { ...recipe, tags: recipeTags };
  });

  return { recipes: recipesWithTags, tags };
};
