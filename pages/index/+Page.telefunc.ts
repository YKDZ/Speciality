import { getContext } from "telefunc";
import { z } from "zod/v4";

import * as recipeQueries from "@/database/drizzle/queries/recipes";

export const onGetRecipesPaginated = async (offset: number, limit: number) => {
  const { db } = getContext<Vike.GlobalContextServer>();
  const recipes = recipeQueries.getRecipesPaginated(db, offset, limit);
  const total = recipeQueries.getRecipesCount(db);
  const enriched = recipes.map((r) => ({
    ...r,
    tags: recipeQueries.getTagsByRecipeId(db, r.id),
  }));
  return { recipes: enriched, total };
};

export const onSearchRecipesPaginated = async (
  query: string,
  offset: number,
  limit: number,
) => {
  const { db } = getContext<Vike.GlobalContextServer>();
  const recipes = recipeQueries.searchRecipesPaginated(
    db,
    query,
    offset,
    limit,
  );
  const total = recipeQueries.searchRecipesCount(db, query);
  const enriched = recipes.map((r) => ({
    ...r,
    tags: recipeQueries.getTagsByRecipeId(db, r.id),
  }));
  return { recipes: enriched, total };
};

export const onGetRecipesByTagsPaginated = async (
  tagIds: string[],
  offset: number,
  limit: number,
) => {
  const parsed = z.array(z.uuid()).parse(tagIds);
  const { db } = getContext<Vike.GlobalContextServer>();
  const recipes = recipeQueries.getRecipesByTagsPaginated(
    db,
    parsed,
    offset,
    limit,
  );
  const total = recipeQueries.getRecipesByTagsCount(db, parsed);
  const enriched = recipes.map((r) => ({
    ...r,
    tags: recipeQueries.getTagsByRecipeId(db, r.id),
  }));
  return { recipes: enriched, total };
};
