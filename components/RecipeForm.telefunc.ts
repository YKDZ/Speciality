import { getContext } from "telefunc";
import { z } from "zod/v4";

import * as ingredientQueries from "@/database/drizzle/queries/ingredients";
import * as tagQueries from "@/database/drizzle/queries/tags";
import { saveUploadedFile } from "@/server/utils/save-upload";

const ingredientSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
});

export const onUploadFile = async (file: File) => {
  const url = await saveUploadedFile(file);
  return { url };
};

export const onCreateTag = async (name: string) => {
  const { db } = getContext<Vike.GlobalContextServer>();
  return tagQueries.insertTag(db, name);
};

export const onCreateIngredient = async (
  input: z.input<typeof ingredientSchema>,
) => {
  const parsed = ingredientSchema.parse(input);
  const { db } = getContext<Vike.GlobalContextServer>();
  return ingredientQueries.insertIngredient(db, parsed);
};
