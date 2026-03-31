import { Hono } from "hono";

import mcpHandler from "./handler/mcp";
import recipeTransferHandler from "./handler/recipe-transfer";
import telefuncHandler from "./handler/telefunc";
import uploadsHandler from "./handler/uploads";

const app = new Hono();

app.route("/_telefunc", telefuncHandler);
app.route("/mcp", mcpHandler);
app.route("/uploads", uploadsHandler);
app.route("/api/recipes", recipeTransferHandler);

export default app;
