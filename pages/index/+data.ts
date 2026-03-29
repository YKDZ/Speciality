import type { PageContextServer } from "vike/types";

import * as recipeQueries from "@/database/drizzle/queries/recipes";
import * as tagQueries from "@/database/drizzle/queries/tags";

export type Data = Awaited<ReturnType<typeof data>>;

const PAGE_SIZE = 12;

export const data = (pageContext: PageContextServer) => {
  const db = pageContext.globalContext.db;
  const recipes = recipeQueries.getRecipesPaginated(db, 0, PAGE_SIZE);
  const total = recipeQueries.getRecipesCount(db);
  const tags = tagQueries.getAllTags(db);
  const enriched = recipes.map((r) => ({
    ...r,
    tags: recipeQueries.getTagsByRecipeId(db, r.id),
  }));
  return { recipes: enriched, tags, total, pageSize: PAGE_SIZE };
};
