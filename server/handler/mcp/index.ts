import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";

import { registerComboResources, registerComboTools } from "./combos";
import {
  registerIngredientResources,
  registerIngredientTools,
} from "./ingredients";
import { registerRecipeResources, registerRecipeTools } from "./recipes";
import { registerReviewResources, registerReviewTools } from "./reviews";
import { registerShoppingTools } from "./shopping";
import { registerTagResources, registerTagTools } from "./tags";

// ── MCP Server ──────────────────────────────────────────────────────────────

const mcpServer = new McpServer({
  name: "hrecipe",
  version: "1.0.0",
});

// Resources (read-only data access via URI)
registerIngredientResources(mcpServer);
registerTagResources(mcpServer);
registerRecipeResources(mcpServer);
registerComboResources(mcpServer);
registerReviewResources(mcpServer);

// Tools (mutating operations + search)
registerIngredientTools(mcpServer);
registerTagTools(mcpServer);
registerRecipeTools(mcpServer);
registerComboTools(mcpServer);
registerReviewTools(mcpServer);
registerShoppingTools(mcpServer);

// ── Hono route ──────────────────────────────────────────────────────────────

const transport = new StreamableHTTPTransport();

const app = new Hono();

app.all("*", async (c) => {
  if (!mcpServer.isConnected()) {
    await mcpServer.connect(transport);
  }
  return transport.handleRequest(c);
});

export default app;
