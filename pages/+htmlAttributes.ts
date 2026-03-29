import type { PageContext } from "vike/types";

import { DEFAULT_LOCALE, isSupportedLocale } from "@/lib/locales";

const getColorScheme = (pageContext: PageContext) => {
  if (!("colorScheme" in pageContext)) {
    return "light";
  }

  return pageContext.colorScheme === "dark" ? "dark" : "light";
};

const getLocale = (pageContext: PageContext) => {
  if (!("locale" in pageContext)) return DEFAULT_LOCALE;
  const locale = pageContext.locale;
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
};

export const htmlAttributes = (pageContext: PageContext) => {
  const colorScheme = getColorScheme(pageContext);
  const locale = getLocale(pageContext);

  return {
    class: colorScheme === "dark" ? "dark" : undefined,
    lang: locale,
  };
};
