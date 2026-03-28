import type { PageContextServer } from "vike/types";

import { useConfig } from "vike-vue/useConfig";

import * as recipeQueries from "@/database/drizzle/queries/recipes";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = (pageContext: PageContextServer) => {
  const config = useConfig();
  const id = pageContext.routeParams.id;

  const recipe = recipeQueries.getRecipeById(pageContext.db, id);
  if (!recipe) {
    throw new Error("Recipe not found");
  }

  config({ title: recipe.name });

  const steps = recipeQueries.getStepsByRecipeId(pageContext.db, id);
  const images = recipeQueries.getImagesByRecipeId(pageContext.db, id);
  const ingredients = recipeQueries.getIngredientsByRecipeId(
    pageContext.db,
    id,
  );
  const tags = recipeQueries.getTagsByRecipeId(pageContext.db, id);
  const reviews = recipeQueries.getReviewsByRecipeId(pageContext.db, id);

  return { recipe, steps, images, ingredients, tags, reviews };
};
