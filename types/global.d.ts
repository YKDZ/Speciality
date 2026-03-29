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
      reviewsEnabled: boolean;
      hideLanguageSwitcher: boolean;
      forceFallbackLocale: boolean;
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
}
