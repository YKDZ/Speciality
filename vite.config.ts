import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
import telefunc from "telefunc/vite";
import vike from "vike/plugin";
import { defineConfig } from "vite-plus";

export default defineConfig({
  define: {
    __VUE_PROD_DEVTOOLS__: false,
  },

  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "."),
    },
  },

  plugins: [vike(), tailwindcss(), vue(), telefunc()],
});
