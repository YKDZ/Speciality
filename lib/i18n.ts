import type { I18n, LocaleMessages, VueMessageType } from "vue-i18n";

import { createI18n } from "vue-i18n";

import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale,
} from "@/lib/locales";

export type AppI18n = I18n<
  Record<string, LocaleMessages<VueMessageType>>,
  Record<string, never>,
  Record<string, never>,
  string,
  false
>;

/** Client-side singleton — survives across client-side navigations. */
let clientI18n: AppI18n | null = null;

/** Return the client-side i18n singleton (null on server / before creation). */
export const getClientI18n = (): AppI18n | null => clientI18n;

/**
 * Get the cached client-side i18n instance, or create a new one.
 * On the server a fresh instance is always created (one per request).
 */
export const getOrCreateI18n = (
  locale: string,
  messages: Record<string, LocaleMessages<VueMessageType>>,
): AppI18n => {
  if (!import.meta.env.SSR && clientI18n) return clientI18n;

  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: FALLBACK_LOCALE,
    messages,
  });

  if (!import.meta.env.SSR) {
    clientI18n = i18n;
  }

  return i18n;
};

/**
 * Load messages for a locale. Returns cached messages if already loaded.
 * Used both during SSR (in +onCreateApp) and on the client (language switch).
 */
export const loadLocaleMessages = async (
  i18n: AppI18n,
  locale: string,
): Promise<void> => {
  const global = i18n.global;
  if (global.availableLocales.includes(locale)) return;

  const entry = SUPPORTED_LOCALES.find((l) => l.id === locale);
  if (!entry) return;

  const messages = await entry.load();
  global.setLocaleMessage(locale, messages);
};

/**
 * Load a single locale's messages and return them in a record suitable
 * for `createAppI18n`. Used during SSR to pre-load only the needed locale.
 */
export const loadInitialMessages = async (
  locale: string,
): Promise<Record<string, LocaleMessages<VueMessageType>>> => {
  const resolved = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  const entry = SUPPORTED_LOCALES.find((l) => l.id === resolved)!;
  const messages = await entry.load();
  return { [resolved]: messages };
};
