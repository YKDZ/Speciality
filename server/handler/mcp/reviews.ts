import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import * as q from "@/database/drizzle/queries/recipes";

import { dbError, getDb, invalidParams, json, textResource } from "./_helpers";

export const registerReviewResources = (server: McpServer) => {
  if (!process.env.REVIEWS_ENABLED) return;

  server.registerResource(
    "recipe_reviews",
    new ResourceTemplate("hrecipe://recipes/{recipeId}/reviews", {
      list: undefined,
    }),
    { description: "List all reviews for a recipe, ordered by creation time" },
    async (uri, { recipeId }) => {
      const db = await getDb();
      return textResource(
        uri.href,
        q.getReviewsByRecipeId(db, String(recipeId)),
      );
    },
  );
};

export const registerReviewTools = (server: McpServer) => {
  server.registerTool(
    "manage_review",
    {
      description: "Create or delete a recipe review",
      inputSchema: {
        action: z.enum(["create", "delete"]).describe("Operation to perform"),
        id: z.uuid().optional().describe("Review UUID (required for delete)"),
        recipeId: z
          .uuid()
          .optional()
          .describe("Recipe UUID (required for create)"),
        author: z
          .string()
          .optional()
          .describe("Author name (required for create)"),
        rating: z
          .int()
          .min(1)
          .max(5)
          .optional()
          .describe("Star rating 1-5 (required for create)"),
        comment: z.string().optional().describe("Optional review comment"),
      },
    },
    async ({ action, id, recipeId, author, rating, comment }) => {
      const db = await getDb();
      try {
        switch (action) {
          case "create": {
            if (!recipeId)
              return invalidParams("recipeId is required for create");
            if (!author) return invalidParams("author is required for create");
            if (!rating) return invalidParams("rating is required for create");
            const recipe = q.getRecipeById(db, recipeId);
            if (!recipe)
              return invalidParams(
                `Recipe with id '${recipeId}' does not exist`,
              );
            return json(
              q.insertReview(db, { recipeId, author, rating, comment }),
            );
          }
          case "delete": {
            if (!id) return invalidParams("id is required for delete");
            q.deleteReview(db, id);
            return json({ deleted: true, id });
          }
        }
      } catch (error) {
        return dbError(error);
      }
    },
  );
};
