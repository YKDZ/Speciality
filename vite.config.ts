import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
import telefunc from "telefunc/vite";
import vike from "vike/plugin";
import { defineConfig } from "vite-plus";

export default defineConfig({
  define: {
    __VUE_PROD_DEVTOOLS__: false,
    __REVIEWS_ENABLED__: JSON.stringify(
      process.env.REVIEWS_ENABLED !== "false",
    ),
    __HIDE_LANGUAGE_SWITCHER__: JSON.stringify(
      process.env.HIDE_LANGUAGE_SWITCHER === "true",
    ),
    __FORCE_FALLBACK_LOCALE__: JSON.stringify(
      process.env.FORCE_FALLBACK_LOCALE === "true",
    ),
  },

  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "."),
    },
  },

  plugins: [vike(), tailwindcss(), vue(), telefunc()],
});
