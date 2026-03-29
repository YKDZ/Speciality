import type { dbSqlite } from "@/database/drizzle/db";

declare global {
  namespace Universal {
    interface Context {
      colorScheme: "light" | "dark";
      colorSchemePreference: string;
      locale: string;
      localePreference: string;
    }
  }

  namespace Vike {
    interface GlobalContext {
      title: string;
    }

    interface GlobalContextServer {
      db: ReturnType<typeof dbSqlite>;
    }

    interface PageContextServer {
      colorScheme: "light" | "dark";
      colorSchemePreference: string;
      locale: string;
      localePreference: string;
    }
  }

  // vue-i18n feature flag used in production SSR
  // eslint-disable-next-line no-var
  var __VUE_PROD_DEVTOOLS__: boolean;

  declare const __REVIEWS_ENABLED__: boolean;
  declare const __HIDE_LANGUAGE_SWITCHER__: boolean;
  declare const __FORCE_FALLBACK_LOCALE__: boolean;
}
