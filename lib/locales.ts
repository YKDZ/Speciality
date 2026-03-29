import type { LocaleMessages, VueMessageType } from "vue-i18n";

export interface LocaleEntry {
  /** BCP 47 language tag, e.g. "zh-CN" */
  id: string;
  /** Native display name shown in the language selector */
  label: string;
  /** Dynamic import returning the messages object */
  load: () => Promise<LocaleMessages<VueMessageType>>;
}

/**
 * All supported locales.
 * To add a new language, append an entry here and create the corresponding
 * `locales/<id>.json` file.
 */
export const SUPPORTED_LOCALES: LocaleEntry[] = [
  {
    id: "zh-CN",
    label: "简体中文",
    load: async () => import("@/locales/zh-CN.json").then((m) => m.default),
  },
  {
    id: "en-US",
    label: "English",
    load: async () => import("@/locales/en-US.json").then((m) => m.default),
  },
];

export const SUPPORTED_LOCALE_IDS = SUPPORTED_LOCALES.map((l) => l.id);

export const DEFAULT_LOCALE = "zh-CN";

/**
 * The fallback locale used when all resolution strategies fail.
 * Server: set via `FALLBACK_LOCALE` env var (read through Vite define).
 * Client: always uses DEFAULT_LOCALE since the server already resolved it.
 */
export const FALLBACK_LOCALE: string =
  (import.meta.env.SSR && typeof process !== "undefined"
    ? process.env.FALLBACK_LOCALE
    : undefined) || DEFAULT_LOCALE;

/** Check whether a string is a supported locale ID. */
export const isSupportedLocale = (id: string): boolean =>
  SUPPORTED_LOCALE_IDS.includes(id);

/**
 * Map a BCP 47 tag (or prefix) to the closest supported locale.
 * e.g. "zh" → "zh-CN", "en-GB" → "en-US", "fr" → null
 */
export const matchLocale = (tag: string): string | null => {
  const lower = tag.toLowerCase();
  // Exact match first
  const exact = SUPPORTED_LOCALES.find((l) => l.id.toLowerCase() === lower);
  if (exact) return exact.id;
  // Prefix match (e.g. "zh" matches "zh-CN")
  const prefix = SUPPORTED_LOCALES.find(
    (l) =>
      l.id.toLowerCase().startsWith(lower + "-") ||
      lower.startsWith(l.id.toLowerCase().split("-")[0]),
  );
  return prefix?.id ?? null;
};
