import { getContext } from "telefunc";

import * as tagQueries from "@/database/drizzle/queries/tags";

export const onGetAllTags = async () => {
  const { db } = getContext<Vike.PageContextServer>();
  return tagQueries.getAllTags(db);
};

export const onCreateTag = async (name: string) => {
  const { db } = getContext<Vike.PageContextServer>();
  return tagQueries.insertTag(db, name);
};

export const onUpdateTag = async (id: string, name: string) => {
  const { db } = getContext<Vike.PageContextServer>();
  return tagQueries.updateTag(db, id, name);
};

export const onDeleteTag = async (id: string) => {
  const { db } = getContext<Vike.PageContextServer>();
  return tagQueries.deleteTag(db, id);
};
