import type { PageContext } from "vike/types";

import { i18n } from "@/locales/index";

export const onCreateApp = (pageContext: PageContext) => {
  if (pageContext.isRenderingHead) return;

  const app = pageContext.app;
  app!.use(i18n);
};
