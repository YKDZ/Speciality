import type { PageContextServer } from "vike/types";

import { useConfig } from "vike-vue/useConfig";

import * as comboQueries from "@/database/drizzle/queries/combos";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = (pageContext: PageContextServer) => {
  const config = useConfig();
  const id = pageContext.routeParams.id;
  const db = pageContext.globalContext.db;

  const combo = comboQueries.getComboById(db, id);
  if (!combo) {
    throw new Error("Combo not found");
  }

  config({ title: combo.name });

  const recipes = comboQueries.getRecipesByComboId(db, id);
  const ingredients = comboQueries.getComboIngredients(db, id);

  const autoTime = recipes.reduce((sum, r) => sum + (r.estimatedTime ?? 0), 0);
  const totalTime = combo.estimatedTime ?? autoTime;

  return { combo, recipes, ingredients, totalTime };
};
