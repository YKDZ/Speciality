import { createI18n } from "vue-i18n";

import { en, zh } from "./messages";

export const i18n = createI18n({
  legacy: false,
  locale: "zh",
  fallbackLocale: "en",
  messages: { zh, en },
});
