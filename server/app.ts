import { Hono } from "hono";

import mcpHandler from "./handler/mcp";
import telefuncHandler from "./handler/telefunc";
import uploadsHandler from "./handler/uploads";

const app = new Hono();

app.route("/_telefunc", telefuncHandler);
app.route("/mcp", mcpHandler);
app.route("/uploads", uploadsHandler);

export default app;
