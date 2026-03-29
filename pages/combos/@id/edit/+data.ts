import type { PageContextServer } from "vike/types";

import { useConfig } from "vike-vue/useConfig";

import * as comboQueries from "@/database/drizzle/queries/combos";
import * as recipeQueries from "@/database/drizzle/queries/recipes";
import { serverT } from "@/lib/server-t";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = (pageContext: PageContextServer) => {
  const config = useConfig();
  const id = pageContext.routeParams.id;
  const db = pageContext.globalContext.db;

  const combo = comboQueries.getComboById(db, id);
  if (!combo) throw new Error("Combo not found");

  config({
    title: serverT(pageContext.locale, "{name} - 编辑", { name: combo.name }),
  });

  const comboRecipes = comboQueries.getRecipesByComboId(db, id);
  const allRecipes = recipeQueries.getAllRecipes(db);

  return { combo, comboRecipes, allRecipes };
};
