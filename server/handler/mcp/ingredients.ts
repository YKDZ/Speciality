import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import * as q from "@/database/drizzle/queries/ingredients";

import {
  dbError,
  getDb,
  invalidParams,
  json,
  notFound,
  textResource,
} from "./_helpers";

export const registerIngredientResources = (server: McpServer) => {
  server.registerResource(
    "ingredients_list",
    "hrecipe://ingredients",
    { description: "List all ingredients" },
    async (uri) => {
      const db = await getDb();
      return textResource(uri.href, q.getAllIngredients(db));
    },
  );

  server.registerResource(
    "ingredient_detail",
    new ResourceTemplate("hrecipe://ingredients/{id}", { list: undefined }),
    { description: "Get an ingredient by UUID" },
    async (uri, { id }) => {
      const db = await getDb();
      const item = q.getIngredientById(db, String(id));
      return textResource(uri.href, item ?? { error: "Ingredient not found" });
    },
  );
};

export const registerIngredientTools = (server: McpServer) => {
  server.registerTool(
    "manage_ingredient",
    {
      description: "Create, update, or delete an ingredient",
      inputSchema: {
        action: z
          .enum(["create", "update", "delete"])
          .describe("Operation to perform"),
        id: z
          .uuid()
          .optional()
          .describe("Ingredient UUID (required for update/delete)"),
        name: z
          .string()
          .optional()
          .describe("Ingredient name (required for create)"),
        description: z.string().optional().describe("Optional description"),
      },
    },
    async ({ action, id, name, description }) => {
      const db = await getDb();
      try {
        switch (action) {
          case "create": {
            if (!name) return invalidParams("name is required for create");
            return json(q.insertIngredient(db, { name, description }));
          }
          case "update": {
            if (!id) return invalidParams("id is required for update");
            const existing = q.getIngredientById(db, id);
            if (!existing) return notFound("Ingredient");
            return json(q.updateIngredient(db, id, { name, description }));
          }
          case "delete": {
            if (!id) return invalidParams("id is required for delete");
            const existing = q.getIngredientById(db, id);
            if (!existing) return notFound("Ingredient");
            q.deleteIngredient(db, id);
            return json({ deleted: true, id });
          }
        }
      } catch (error) {
        return dbError(error);
      }
    },
  );
};
