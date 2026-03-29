import type { PageContext } from "vike/types";

import { getOrCreateI18n, loadInitialMessages } from "@/lib/i18n";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/lib/locales";

export const onCreateApp = async (pageContext: PageContext) => {
  if (pageContext.isRenderingHead) return;

  const locale =
    "locale" in pageContext && isSupportedLocale(pageContext.locale)
      ? pageContext.locale
      : DEFAULT_LOCALE;

  const messages = await loadInitialMessages(locale);
  const i18n = getOrCreateI18n(locale, messages);
  pageContext.app!.use(i18n);
};
