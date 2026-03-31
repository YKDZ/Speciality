import "dotenv/config";
import { apply, serve } from "@photonjs/hono";

import app from "./app";
import { langMiddleware } from "./middleware/lang-middleware";
import { themeMiddleware } from "./middleware/theme-middleware";

// vue-i18n reads this global at install time; it's not bundled in SSR so
// Vite's `define` doesn't reach it - polyfill before any Vue code runs.
globalThis.__VUE_PROD_DEVTOOLS__ = false;

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const startApp = () => {
  apply(app, [themeMiddleware, langMiddleware]);

  return serve(app, {
    port,
  });
};

export default startApp();
