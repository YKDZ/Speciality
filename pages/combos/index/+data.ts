import type { PageContextServer } from "vike/types";

import * as comboQueries from "@/database/drizzle/queries/combos";
import * as recipeQueries from "@/database/drizzle/queries/recipes";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = (pageContext: PageContextServer) => {
  const db = pageContext.globalContext.db;
  const combos = comboQueries.getAllCombos(db);

  const enriched = combos.map((combo) => {
    const recipes = comboQueries.getRecipesByComboId(db, combo.id);
    const autoTime = recipes.reduce(
      (sum, r) => sum + (r.estimatedTime ?? 0),
      0,
    );
    return {
      ...combo,
      recipeCount: recipes.length,
      totalTime: combo.estimatedTime ?? autoTime,
      recipeCoverItems: recipes
        .filter((r) => r.coverImage !== null)
        .map((r) => ({ image: r.coverImage!, time: r.estimatedTime ?? 1 })),
    };
  });

  const allRecipes = recipeQueries.getAllRecipes(db);

  return { combos: enriched, allRecipes };
};
