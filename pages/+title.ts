import type { PageContext } from "vike/types";

export function title(pageContext: PageContext) {
  return pageContext.globalContext.title || "HRecipe";
}
