import type { BasicColorSchema } from "@vueuse/core";

import { useColorMode } from "@vueuse/core";
import { usePageContext } from "vike-vue/usePageContext";
import { computed, watch } from "vue";

const COOKIE_NAME = "theme";

const readThemeCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)theme=(light|dark|auto)/);
  return match?.[1] ?? null;
};

const writeThemeCookie = (value: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${value};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
};

export const useTheme = () => {
  const pageContext = usePageContext();
  const savedPref =
    readThemeCookie() ??
    ("colorSchemePreference" in pageContext
      ? pageContext.colorSchemePreference
      : null);

  const initialValue: BasicColorSchema =
    savedPref === "light" || savedPref === "dark" || savedPref === "auto"
      ? savedPref
      : "auto";

  const { store, system, state } = useColorMode({
    selector: "html",
    attribute: "class",
    modes: { light: "", dark: "dark", auto: "" },
    storageKey: "vueuse-color-scheme",
    initialValue,
    emitAuto: true,
  });

  // store = user preference ("auto" | "light" | "dark")
  // state = resolved actual mode ("light" | "dark")
  const isDark = computed(() => state.value === "dark");

  // Sync cookie so the server middleware can read it
  watch(
    store,
    (val) => {
      writeThemeCookie(val);
    },
    { immediate: true },
  );

  const setTheme = (mode: BasicColorSchema) => {
    store.value = mode;
  };

  return { preference: store, isDark, system, setTheme };
};
