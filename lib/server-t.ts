import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALE_IDS,
  isSupportedLocale,
} from "@/lib/locales";

const localeModules = import.meta.glob<Record<string, string>>(
  "../locales/*.json",
  {
    eager: true,
    import: "default",
  },
);

const allMessages: Record<string, Record<string, string>> = {};
for (const [path, messages] of Object.entries(localeModules)) {
  const id = path.match(/([^/]+)\.json$/)?.[1];
  if (id && SUPPORTED_LOCALE_IDS.includes(id)) {
    allMessages[id] = messages;
  }
}

/**
 * Synchronous server-side translation for use in +data.ts hooks,
 * which run before the Vue app (and vue-i18n) is initialised.
 */
export const serverT = (
  locale: string,
  key: string,
  params?: Record<string, string | number>,
): string => {
  const resolved = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  const messages = allMessages[resolved] ?? allMessages[DEFAULT_LOCALE];
  let result = messages[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      result = result.replaceAll(`{${k}}`, String(v));
    }
  }
  return result;
};
