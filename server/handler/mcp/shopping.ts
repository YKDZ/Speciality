import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { z } from "zod";

import * as comboQueries from "@/database/drizzle/queries/combos";
import * as recipeQueries from "@/database/drizzle/queries/recipes";
import {
  buildMergedItems,
  exportGroupedAsText,
  exportMergedAsText,
  groupShoppingItems,
} from "@/lib/export";

import { dbError, getDb, json } from "./_helpers";

interface RawShoppingItem {
  ingredientId: string;
  ingredientName: string;
  quantity?: string;
  unit?: string;
  note?: string;
  recipeName: string;
}

const collectItems = (
  db: Parameters<typeof recipeQueries.getIngredientsByRecipeId>[0],
  recipeIds: string[],
  comboIds: string[],
): RawShoppingItem[] => {
  const items: RawShoppingItem[] = [];

  for (const recipeId of recipeIds) {
    const recipe = recipeQueries.getRecipeById(db, recipeId);
    if (!recipe) continue;
    const ings = recipeQueries.getIngredientsByRecipeId(db, recipeId);
    for (const ing of ings) {
      items.push({
        ingredientId: ing.ingredientId,
        ingredientName: ing.ingredientName,
        quantity: ing.quantity ?? undefined,
        unit: ing.unit ?? undefined,
        note: ing.note ?? undefined,
        recipeName: recipe.name,
      });
    }
  }

  for (const comboId of comboIds) {
    const comboIngs = comboQueries.getComboIngredients(db, comboId);
    for (const ing of comboIngs) {
      items.push({
        ingredientId: ing.ingredientId,
        ingredientName: ing.ingredientName,
        quantity: ing.quantity ?? undefined,
        unit: ing.unit ?? undefined,
        note: ing.note ?? undefined,
        recipeName: ing.recipeName,
      });
    }
  }

  return items;
};

export const registerShoppingTools = (server: McpServer) => {
  server.registerTool(
    "get_shopping_list",
    {
      description:
        "Generate a shopping list for one or more recipes and/or combos. " +
        "Returns ingredient items grouped and optionally merged (same-unit quantities summed). " +
        "Supports plain-text output for easy copying.",
      inputSchema: {
        recipeIds: z
          .array(z.string())
          .optional()
          .describe("UUIDs of recipes to include"),
        comboIds: z
          .array(z.string())
          .optional()
          .describe("UUIDs of combos to include (expands to their recipes)"),
        merge: z
          .boolean()
          .default(true)
          .describe(
            "Merge same-ingredient same-unit quantities (default: true)",
          ),
        format: z
          .enum(["json", "text"])
          .default("json")
          .describe("Output format: structured JSON or human-readable text"),
        title: z
          .string()
          .optional()
          .describe("Title for text output (default: 采购表)"),
      },
    },
    async ({ recipeIds, comboIds, merge, format, title }) => {
      const db = await getDb();
      try {
        const rIds = recipeIds ?? [];
        const cIds = comboIds ?? [];

        if (rIds.length === 0 && cIds.length === 0) {
          return json({
            items: [],
            message: "No recipe or combo IDs provided",
          });
        }

        const rawItems = collectItems(db, rIds, cIds);
        const grouped = groupShoppingItems(rawItems);

        if (format === "text") {
          const titleStr = title ?? "采购表";
          const isSingleRecipe =
            rawItems.length === 0 ||
            rawItems.every((i) => i.recipeName === rawItems[0].recipeName);

          const text = merge
            ? exportMergedAsText(
                buildMergedItems(grouped),
                titleStr,
                isSingleRecipe,
              )
            : exportGroupedAsText(grouped, titleStr, isSingleRecipe);

          return { content: [{ type: "text" as const, text }] };
        }

        // JSON format
        if (merge) {
          return json(buildMergedItems(grouped));
        }
        return json(grouped);
      } catch (error) {
        return dbError(error);
      }
    },
  );
};
