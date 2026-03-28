import type { dbSqlite } from "./database/drizzle/db";

declare global {
  namespace Vike {
    interface PageContextServer {
      db: ReturnType<typeof dbSqlite>;
    }
  }

  // vue-i18n feature flag used in production SSR
  // eslint-disable-next-line no-var
  var __VUE_PROD_DEVTOOLS__: boolean;
}
