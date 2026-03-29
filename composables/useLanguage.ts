import { usePageContext } from "vike-vue/usePageContext";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import { getClientI18n, loadLocaleMessages } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale,
} from "@/lib/locales";

/** Value stored in the cookie: "auto" or a concrete locale id. */
type LocalePreference = string;

const COOKIE_NAME = "locale";

const readPreferenceCookie = (): LocalePreference | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)locale=([a-zA-Z-]+)/);
  if (!match) return null;
  const value = match[1];
  if (value === "auto") return "auto";
  return isSupportedLocale(value) ? value : null;
};

const writePreferenceCookie = (value: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${value};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
};

/**
 * Whether the language switcher UI should be visible.
 * Hidden when either HIDE_LANGUAGE_SWITCHER or FORCE_FALLBACK_LOCALE is enabled.
 */
export const showLanguageSwitcher =
  !__HIDE_LANGUAGE_SWITCHER__ && !__FORCE_FALLBACK_LOCALE__;

export const useLanguage = () => {
  const { locale: i18nLocale } = useI18n();

  // When FORCE_FALLBACK_LOCALE is enabled, lock to FALLBACK_LOCALE
  if (__FORCE_FALLBACK_LOCALE__) {
    const preference = ref<LocalePreference>(FALLBACK_LOCALE);
    const currentLocale = ref(FALLBACK_LOCALE);
    i18nLocale.value = FALLBACK_LOCALE;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const setPreference = async (_id: LocalePreference) => {};
    return {
      preference,
      currentLocale,
      setPreference,
      supportedLocales: SUPPORTED_LOCALES,
    };
  }

  const pageContext = usePageContext();
  const savedPref =
    readPreferenceCookie() ??
    ("localePreference" in pageContext ? pageContext.localePreference : null);
  // The server-resolved locale (from Accept-Language or cookie) is in i18nLocale
  const serverLocale = isSupportedLocale(i18nLocale.value)
    ? i18nLocale.value
    : DEFAULT_LOCALE;

  // preference = what the user explicitly chose ("auto" or a locale id)
  const preference = ref<LocalePreference>(savedPref ?? "auto");
  // currentLocale = the actually active locale
  const currentLocale = ref(
    preference.value === "auto" ? serverLocale : preference.value,
  );

  // Sync i18n if needed on init
  if (currentLocale.value !== i18nLocale.value) {
    i18nLocale.value = currentLocale.value;
  }

  watch(currentLocale, (val) => {
    i18nLocale.value = val;
    if (typeof document !== "undefined") {
      document.documentElement.lang = val;
    }
  });

  const setPreference = async (id: LocalePreference) => {
    if (id === preference.value) return;
    preference.value = id;

    if (id === "auto") {
      writePreferenceCookie("auto");
      // "auto" on client: keep current server-resolved locale
      // Next page load will re-resolve from Accept-Language
      currentLocale.value = serverLocale;
    } else {
      if (!isSupportedLocale(id)) return;
      writePreferenceCookie(id);
      const i18n = getClientI18n();
      if (i18n) await loadLocaleMessages(i18n, id);
      currentLocale.value = id;
    }
  };

  return {
    preference,
    currentLocale,
    setPreference,
    supportedLocales: SUPPORTED_LOCALES,
  };
};
