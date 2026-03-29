import { getContext } from "telefunc";
import { z } from "zod";

import * as comboQueries from "@/database/drizzle/queries/combos";

export const onDeleteCombo = async (id: string) => {
  const { db } = getContext<Vike.GlobalContextServer>();
  z.uuid().parse(id);
  comboQueries.deleteCombo(db, id);
  return { success: true };
};
