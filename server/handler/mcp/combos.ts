import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import * as q from "@/database/drizzle/queries/combos";

import {
  dbError,
  getDb,
  invalidParams,
  json,
  notFound,
  textResource,
} from "./_helpers";

const comboRecipeSchema = z.object({
  recipeId: z.uuid().describe("UUID of existing recipe"),
  sortOrder: z.int(),
});

export const registerComboResources = (server: McpServer) => {
  server.registerResource(
    "combo_detail",
    new ResourceTemplate("hrecipe://combos/{id}", { list: undefined }),
    {
      description:
        "Get full combo details including recipes and aggregated ingredients",
    },
    async (uri, { id }) => {
      const db = await getDb();
      const idStr = String(id);
      const combo = q.getComboById(db, idStr);
      if (!combo) return textResource(uri.href, { error: "Combo not found" });
      const recipes = q.getRecipesByComboId(db, idStr);
      const ingredients = q.getComboIngredients(db, idStr);
      return textResource(uri.href, { ...combo, recipes, ingredients });
    },
  );
};

export const registerComboTools = (server: McpServer) => {
  server.registerTool(
    "manage_combo",
    {
      description: "Create, update, or delete a combo (meal combination)",
      inputSchema: {
        action: z
          .enum(["create", "update", "delete"])
          .describe("Operation to perform"),
        id: z
          .uuid()
          .optional()
          .describe("Combo UUID (required for update/delete)"),
        name: z
          .string()
          .optional()
          .describe("Combo name (required for create)"),
        description: z.string().optional().describe("Combo description"),
        estimatedTime: z
          .int()
          .positive()
          .optional()
          .describe("Estimated total time in minutes"),
        recipes: z
          .array(comboRecipeSchema)
          .optional()
          .describe("Recipes to include, with sort order"),
      },
    },
    async ({ action, id, name, description, estimatedTime, recipes }) => {
      const db = await getDb();
      try {
        switch (action) {
          case "create": {
            if (!name) return invalidParams("name is required for create");
            const combo = q.insertCombo(db, {
              name,
              description,
              estimatedTime,
            });
            if (recipes?.length) q.upsertComboRecipes(db, combo.id, recipes);
            return json(combo);
          }
          case "update": {
            if (!id) return invalidParams("id is required for update");
            const existing = q.getComboById(db, id);
            if (!existing) return notFound("Combo");
            const combo = q.updateCombo(db, id, {
              name,
              description,
              estimatedTime,
            });
            if (recipes) q.upsertComboRecipes(db, combo.id, recipes);
            return json(combo);
          }
          case "delete": {
            if (!id) return invalidParams("id is required for delete");
            const existing = q.getComboById(db, id);
            if (!existing) return notFound("Combo");
            q.deleteCombo(db, id);
            return json({ deleted: true, id });
          }
        }
      } catch (error) {
        return dbError(error);
      }
    },
  );

  server.registerTool(
    "search_combos",
    {
      description: "Search combos by name or description",
      inputSchema: {
        query: z
          .string()
          .optional()
          .describe("Text to search in combo name/description"),
      },
    },
    async ({ query }) => {
      const db = await getDb();
      return json(query ? q.searchCombos(db, query) : q.getAllCombos(db));
    },
  );
};
