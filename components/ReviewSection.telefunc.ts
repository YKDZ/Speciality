import { getContext } from "telefunc";
import { z } from "zod/v4";

import * as recipeQueries from "@/database/drizzle/queries/recipes";

const reviewSchema = z.object({
  recipeId: z.uuid(),
  author: z.string().min(1).max(100),
  rating: z.int().min(1).max(5),
  comment: z.string().optional(),
});

export const onCreateReview = async (input: z.input<typeof reviewSchema>) => {
  if (!__REVIEWS_ENABLED__) {
    throw new Error("Reviews are disabled");
  }
  const parsed = reviewSchema.parse(input);
  const { db } = getContext<Vike.GlobalContextServer>();
  return recipeQueries.insertReview(db, parsed);
};
