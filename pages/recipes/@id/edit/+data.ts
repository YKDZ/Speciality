import type { PageContextServer } from "vike/types";

import { useConfig } from "vike-vue/useConfig";

import * as ingredientQueries from "@/database/drizzle/queries/ingredients";
import * as recipeQueries from "@/database/drizzle/queries/recipes";
import * as tagQueries from "@/database/drizzle/queries/tags";
import { serverT } from "@/lib/server-t";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = (pageContext: PageContextServer) => {
  const config = useConfig();

  const id = pageContext.routeParams.id;
  const db = pageContext.globalContext.db;

  const recipe = recipeQueries.getRecipeById(db, id);
  if (!recipe) throw new Error("Recipe not found");

  config({
    title: serverT(pageContext.locale, "{name} - 编辑", { name: recipe.name }),
  });

  const steps = recipeQueries.getStepsByRecipeId(db, id);
  const ingredients = recipeQueries.getIngredientsByRecipeId(db, id);
  const recipeTags = recipeQueries.getTagsByRecipeId(db, id);
  const allIngredients = ingredientQueries.getAllIngredients(db);
  const allTags = tagQueries.getAllTags(db);

  return { recipe, steps, ingredients, recipeTags, allIngredients, allTags };
};
