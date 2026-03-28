import type { PageContextServer } from "vike/types";

import * as ingredientQueries from "@/database/drizzle/queries/ingredients";
import * as tagQueries from "@/database/drizzle/queries/tags";

export type Data = Awaited<ReturnType<typeof data>>;

export const data = (_pageContext: PageContextServer) => {
  const allIngredients = ingredientQueries.getAllIngredients(_pageContext.db);
  const allTags = tagQueries.getAllTags(_pageContext.db);
  return { allIngredients, allTags };
};
