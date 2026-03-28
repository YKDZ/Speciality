import "dotenv/config";

// vue-i18n reads this global at install time; it's not bundled in SSR so
// Vite's `define` doesn't reach it — polyfill before any Vue code runs.
globalThis.__VUE_PROD_DEVTOOLS__ = false;

import { apply, serve } from "@photonjs/hono";
import { Hono } from "hono";

import { dbMiddleware } from "./db-middleware";
import telefuncHandler from "./telefunc";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const startApp = () => {
  const app = new Hono();

  app.route("/_telefunc", telefuncHandler);

  apply(app, [dbMiddleware]);

  return serve(app, {
    port,
  });
};

export default startApp();
