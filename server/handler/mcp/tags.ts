import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import * as q from "@/database/drizzle/queries/tags";

import {
  dbError,
  getDb,
  invalidParams,
  json,
  notFound,
  textResource,
} from "./_helpers";

export const registerTagResources = (server: McpServer) => {
  server.registerResource(
    "tags_list",
    "hrecipe://tags",
    { description: "List all tags" },
    async (uri) => {
      const db = await getDb();
      return textResource(uri.href, q.getAllTags(db));
    },
  );

  server.registerResource(
    "tag_detail",
    new ResourceTemplate("hrecipe://tags/{id}", { list: undefined }),
    { description: "Get a tag by UUID" },
    async (uri, { id }) => {
      const db = await getDb();
      const item = q.getTagById(db, String(id));
      return textResource(uri.href, item ?? { error: "Tag not found" });
    },
  );
};

export const registerTagTools = (server: McpServer) => {
  server.registerTool(
    "manage_tag",
    {
      description: "Create, update (rename), or delete a tag",
      inputSchema: {
        action: z
          .enum(["create", "update", "delete"])
          .describe("Operation to perform"),
        id: z
          .uuid()
          .optional()
          .describe("Tag UUID (required for update/delete)"),
        name: z
          .string()
          .optional()
          .describe("Tag name (required for create and update)"),
      },
    },
    async ({ action, id, name }) => {
      const db = await getDb();
      try {
        switch (action) {
          case "create": {
            if (!name) return invalidParams("name is required for create");
            return json(q.insertTag(db, name));
          }
          case "update": {
            if (!id) return invalidParams("id is required for update");
            if (!name) return invalidParams("name is required for update");
            const existing = q.getTagById(db, id);
            if (!existing) return notFound("Tag");
            return json(q.updateTag(db, id, name));
          }
          case "delete": {
            if (!id) return invalidParams("id is required for delete");
            const existing = q.getTagById(db, id);
            if (!existing) return notFound("Tag");
            q.deleteTag(db, id);
            return json({ deleted: true, id });
          }
        }
      } catch (error) {
        return dbError(error);
      }
    },
  );
};
