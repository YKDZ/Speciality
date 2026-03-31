import type { PageContextServer } from "vike/types";

import * as ingredientQueries from "@/database/drizzle/queries/ingredients";
import * as tagQueries from "@/database/drizzle/queries/tags";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = (pageContext: PageContextServer) => {
  const db = pageContext.globalContext.db;
  const allIngredients = ingredientQueries.getAllIngredients(db);
  const allTags = tagQueries.getAllTags(db);
  return { allIngredients, allTags };
};
