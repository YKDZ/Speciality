import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 80,

  ignorePatterns: ["**/dist", "components/ui", "database/migrations"],

  sortImports: {
    groups: [
      "type-import",
      ["value-builtin", "value-external"],
      "type-internal",
      "value-internal",
      ["type-parent", "type-sibling", "type-index"],
      ["value-parent", "value-sibling", "value-index"],
      "unknown",
    ],
  },

  sortTailwindcss: {
    stylesheet: "./pages/tailwind.css",
    functions: ["clsx", "cn"],
    preserveWhitespace: true,
  },

  sortPackageJson: {
    sortScripts: true,
  },
});
