import type { PageContextServer } from "vike/types";

import { useConfig } from "vike-vue/useConfig";

import * as ingredientQueries from "@/database/drizzle/queries/ingredients";
import * as recipeQueries from "@/database/drizzle/queries/recipes";
import * as tagQueries from "@/database/drizzle/queries/tags";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = (pageContext: PageContextServer) => {
  const config = useConfig();
  const id = pageContext.routeParams.id;

  const recipe = recipeQueries.getRecipeById(pageContext.db, id);
  if (!recipe) throw new Error("Recipe not found");

  config({ title: `${recipe.name} - 编辑` });

  const steps = recipeQueries.getStepsByRecipeId(pageContext.db, id);
  const ingredients = recipeQueries.getIngredientsByRecipeId(
    pageContext.db,
    id,
  );
  const recipeTags = recipeQueries.getTagsByRecipeId(pageContext.db, id);
  const allIngredients = ingredientQueries.getAllIngredients(pageContext.db);
  const allTags = tagQueries.getAllTags(pageContext.db);

  return { recipe, steps, ingredients, recipeTags, allIngredients, allTags };
};
