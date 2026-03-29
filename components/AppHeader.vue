<script setup lang="ts">
import { Menu, Monitor, Moon, Plus, Sun, X } from "lucide-vue-next";
import { usePageContext } from "vike-vue/usePageContext";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import logoUrl from "@/assets/logo.svg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/composables/useLanguage";
import { useTheme } from "@/composables/useTheme";

const { t } = useI18n();
const { preference: themePref, isDark, setTheme } = useTheme();
const {
  preference: localePref,
  setPreference: setLocalePref,
  supportedLocales,
  showLanguageSwitcher,
} = useLanguage();
const pageContext = usePageContext();
const mobileOpen = ref(false);

const navLinks = computed(() => [
  { href: "/", label: t("食谱") },
  { href: "/combos", label: t("搭配") },
  { href: "/admin", label: t("控制面板") },
]);

const cycleTheme = () => {
  const order = ["auto", "light", "dark"] as const;
  const idx = order.indexOf(themePref.value as "auto" | "light" | "dark");
  setTheme(order[(idx + 1) % order.length]);
};

const themeIcon = computed(() => {
  if (themePref.value === "auto") return "auto";
  return themePref.value === "dark" ? "moon" : "sun";
});

const themeTitle = computed(() => {
  if (themePref.value === "auto") return t("跟随系统");
  return themePref.value === "dark" ? t("黑夜模式") : t("白天模式");
});

const selectedLocaleLabel = computed(() => {
  if (localePref.value === "auto") return t("跟随系统");
  const entry = supportedLocales.find((l) => l.id === localePref.value);
  return entry?.label ?? localePref.value;
});

const isActive = (href: string) => {
  const { urlPathname } = pageContext;
  return href === "/" ? urlPathname === href : urlPathname.startsWith(href);
};
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-(--color-border) bg-surface/95 backdrop-blur-sm"
  >
    <div
      class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
    >
      <!-- Logo & Title -->
      <a
        href="/"
        class="flex items-center gap-2 text-lg font-bold tracking-tight"
      >
        <img :src="logoUrl" alt="Logo" class="size-7" />
        <span>{{ pageContext.globalContext.title }}</span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden items-center gap-6 text-sm font-medium md:flex">
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          class="transition-colors hover:text-(--color-primary)"
          :class="
            isActive(link.href)
              ? 'font-semibold text-(--color-primary)'
              : 'text-(--color-on-surface-muted)'
          "
        >
          {{ link.label }}
        </a>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <!-- New Recipe button -->
        <a
          href="/recipes/new"
          class="hidden items-center gap-1.5 rounded bg-(--color-primary) px-3 py-1.5 text-sm font-semibold text-(--color-on-primary) transition-colors hover:bg-(--color-primary-hover) sm:inline-flex"
        >
          <Plus class="size-4" />
          {{ t("新建食谱") }}
        </a>
        <!-- Language select -->
        <Select
          v-if="showLanguageSwitcher"
          :model-value="localePref"
          @update:model-value="
            (v) => {
              if (typeof v === 'string') setLocalePref(v);
            }
          "
        >
          <SelectTrigger
            size="sm"
            class="w-auto gap-1.5"
            :title="t('切换语言')"
          >
            <SelectValue :placeholder="selectedLocaleLabel">{{
              selectedLocaleLabel
            }}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">
              {{ t("跟随系统") }}
            </SelectItem>
            <SelectItem
              v-for="locale in supportedLocales"
              :key="locale.id"
              :value="locale.id"
            >
              {{ locale.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <!-- Dark mode toggle -->
        <button
          class="rounded p-2 transition-colors hover:bg-(--color-surface-hover)"
          :title="themeTitle"
          @click="cycleTheme()"
        >
          <Monitor v-if="themeIcon === 'auto'" class="h-5 w-5" />
          <Sun v-else-if="themeIcon === 'sun'" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </button>

        <!-- Mobile menu toggle -->
        <button
          class="rounded p-2 transition-colors hover:bg-(--color-surface-hover) md:hidden"
          @click="mobileOpen = !mobileOpen"
        >
          <Menu v-if="!mobileOpen" class="h-5 w-5" />
          <X v-else class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Mobile Nav -->
    <nav
      v-if="mobileOpen"
      class="border-t border-(--color-border) px-4 pt-2 pb-4 md:hidden"
    >
      <a
        v-for="link in navLinks"
        :key="link.href"
        :href="link.href"
        class="block rounded px-3 py-2 text-sm font-medium transition-colors hover:bg-(--color-surface-hover)"
        :class="
          isActive(link.href)
            ? 'text-(--color-primary)'
            : 'text-(--color-on-surface-muted)'
        "
        @click="mobileOpen = false"
      >
        {{ link.label }}
      </a>
    </nav>
  </header>
</template>
