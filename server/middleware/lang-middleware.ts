import { enhance, type UniversalMiddleware } from "@universal-middleware/core";

import {
  FALLBACK_LOCALE,
  SUPPORTED_LOCALE_IDS,
  matchLocale,
} from "@/lib/locales";

const getCookieLocale = (cookieHeader: string): string | null => {
  const match = cookieHeader.match(/(?:^|;\s*)locale=([a-zA-Z-]+)/);
  if (!match) return null;
  const value = match[1];
  // "auto" means the user wants browser-detected language - skip cookie resolution
  if (value === "auto") return null;
  return SUPPORTED_LOCALE_IDS.includes(value) ? value : null;
};

const getAcceptLanguageLocale = (header: string | null): string | null => {
  if (!header) return null;
  const parts = header.split(",").map((part) => {
    const [lang, q] = part.trim().split(";q=");
    return { lang: lang.trim(), q: q ? parseFloat(q) : 1 };
  });
  parts.sort((a, b) => b.q - a.q);
  for (const { lang } of parts) {
    const matched = matchLocale(lang);
    if (matched) return matched;
  }
  return null;
};

const forceLocale = process.env.FORCE_FALLBACK_LOCALE === "true";

const getCookieRawPreference = (cookieHeader: string): string | null => {
  const match = cookieHeader.match(/(?:^|;\s*)locale=([a-zA-Z-]+)/);
  if (!match) return null;
  const value = match[1];
  if (value === "auto") return "auto";
  return SUPPORTED_LOCALE_IDS.includes(value) ? value : null;
};

const resolveLocale = (
  request: Request,
): { locale: string; localePreference: string } => {
  if (forceLocale)
    return { locale: FALLBACK_LOCALE, localePreference: FALLBACK_LOCALE };

  const cookieHeader = request.headers.get("cookie") ?? "";
  const rawPref = getCookieRawPreference(cookieHeader);
  const cookieLocale = getCookieLocale(cookieHeader);

  if (cookieLocale) {
    return { locale: cookieLocale, localePreference: rawPref ?? "auto" };
  }

  const acceptLocale = getAcceptLanguageLocale(
    request.headers.get("accept-language"),
  );
  const locale = acceptLocale ?? FALLBACK_LOCALE;

  return { locale, localePreference: rawPref ?? "auto" };
};

export const langMiddleware: UniversalMiddleware = enhance(
  async (request, context) => ({
    ...context,
    ...resolveLocale(request),
  }),
  { name: "my-app:lang-middleware", immutable: false },
);
