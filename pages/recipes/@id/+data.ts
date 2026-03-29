import type { PageContextServer } from "vike/types";

import { useConfig } from "vike-vue/useConfig";

import * as recipeQueries from "@/database/drizzle/queries/recipes";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = (pageContext: PageContextServer) => {
  const config = useConfig();
  const id = pageContext.routeParams.id;
  const db = pageContext.globalContext.db;

  const recipe = recipeQueries.getRecipeById(db, id);
  if (!recipe) {
    throw new Error("Recipe not found");
  }

  config({ title: recipe.name });

  const steps = recipeQueries.getStepsByRecipeId(db, id);
  const images = recipeQueries.getImagesByRecipeId(db, id);
  const ingredients = recipeQueries.getIngredientsByRecipeId(db, id);
  const tags = recipeQueries.getTagsByRecipeId(db, id);
  const reviews = recipeQueries.getReviewsByRecipeId(db, id);

  return { recipe, steps, images, ingredients, tags, reviews };
};
