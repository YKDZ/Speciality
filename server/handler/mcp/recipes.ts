import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import * as q from "@/database/drizzle/queries/recipes";

import {
  dbError,
  getDb,
  invalidParams,
  json,
  notFound,
  textResource,
} from "./_helpers";

const stepSchema = z.object({
  content: z.string(),
  sortOrder: z.number().int(),
  name: z.string().optional(),
});

const ingredientItemSchema = z.object({
  ingredientId: z.uuid().describe("UUID of existing ingredient"),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  note: z.string().optional(),
});

export const registerRecipeResources = (server: McpServer) => {
  server.registerResource(
    "recipe_detail",
    new ResourceTemplate("hrecipe://recipes/{id}", { list: undefined }),
    {
      description:
        "Get full recipe details including steps, ingredients, and tags",
    },
    async (uri, { id }) => {
      const db = await getDb();
      const idStr = String(id);
      const recipe = q.getRecipeById(db, idStr);
      if (!recipe) return textResource(uri.href, { error: "Recipe not found" });
      const steps = q.getStepsByRecipeId(db, idStr);
      const ingredients = q.getIngredientsByRecipeId(db, idStr);
      const tags = q.getTagsByRecipeId(db, idStr);
      return textResource(uri.href, { ...recipe, steps, ingredients, tags });
    },
  );
};

export const registerRecipeTools = (server: McpServer) => {
  server.registerTool(
    "manage_recipe",
    {
      description:
        "Create, update, or delete a recipe (with optional steps, ingredients, tags)",
      inputSchema: {
        action: z
          .enum(["create", "update", "delete"])
          .describe("Operation to perform"),
        id: z
          .uuid()
          .optional()
          .describe("Recipe UUID (required for update/delete)"),
        name: z
          .string()
          .optional()
          .describe("Recipe name (required for create)"),
        description: z.string().optional().describe("Recipe description"),
        estimatedTime: z
          .int()
          .positive()
          .optional()
          .describe("Estimated cooking time in minutes"),
        steps: z.array(stepSchema).optional().describe("Ordered cooking steps"),
        ingredients: z
          .array(ingredientItemSchema)
          .optional()
          .describe("Ingredients with quantities"),
        tagIds: z
          .array(z.uuid())
          .optional()
          .describe("UUIDs of existing tags to attach"),
      },
    },
    async ({
      action,
      id,
      name,
      description,
      estimatedTime,
      steps,
      ingredients,
      tagIds,
    }) => {
      const db = await getDb();
      try {
        switch (action) {
          case "create": {
            if (!name) return invalidParams("name is required for create");
            const recipe = q.insertRecipe(db, {
              name,
              description,
              estimatedTime,
            });
            if (steps?.length) q.upsertSteps(db, recipe.id, steps);
            if (ingredients?.length)
              q.upsertRecipeIngredients(db, recipe.id, ingredients);
            if (tagIds?.length) q.upsertRecipeTags(db, recipe.id, tagIds);
            return json(recipe);
          }
          case "update": {
            if (!id) return invalidParams("id is required for update");
            const existing = q.getRecipeById(db, id);
            if (!existing) return notFound("Recipe");
            const recipe = q.updateRecipe(db, id, {
              name,
              description,
              estimatedTime,
            });
            if (steps) q.upsertSteps(db, recipe.id, steps);
            if (ingredients)
              q.upsertRecipeIngredients(db, recipe.id, ingredients);
            if (tagIds) q.upsertRecipeTags(db, recipe.id, tagIds);
            return json(recipe);
          }
          case "delete": {
            if (!id) return invalidParams("id is required for delete");
            const existing = q.getRecipeById(db, id);
            if (!existing) return notFound("Recipe");
            q.deleteRecipe(db, id);
            return json({ deleted: true, id });
          }
        }
      } catch (error) {
        return dbError(error);
      }
    },
  );

  server.registerTool(
    "search_recipes",
    {
      description:
        "Search recipes by name/description, optionally filter by tags, with pagination",
      inputSchema: {
        query: z
          .string()
          .optional()
          .describe("Text to search in recipe name/description"),
        tagIds: z
          .array(z.uuid())
          .optional()
          .describe("Filter by tag UUIDs (all must match)"),
        offset: z
          .number()
          .int()
          .min(0)
          .default(0)
          .describe("Pagination offset"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(20)
          .describe("Max results to return"),
        countOnly: z
          .boolean()
          .default(false)
          .describe("Return only the total count"),
      },
    },
    async ({ query, tagIds, offset, limit, countOnly }) => {
      const db = await getDb();
      if (countOnly) {
        let count: number;
        if (tagIds?.length) {
          count = q.getRecipesByTagsCount(db, tagIds);
        } else if (query) {
          count = q.searchRecipesCount(db, query);
        } else {
          count = q.getRecipesCount(db);
        }
        return json({ count });
      }
      let results;
      if (tagIds?.length) {
        results = q.getRecipesByTagsPaginated(db, tagIds, offset, limit);
      } else if (query) {
        results = q.searchRecipesPaginated(db, query, offset, limit);
      } else {
        results = q.getRecipesPaginated(db, offset, limit);
      }
      return json(results);
    },
  );
};
