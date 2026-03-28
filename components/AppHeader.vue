<template>
  <header
    class="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]"
  >
    <div
      class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
    >
      <!-- Logo & Title -->
      <a
        href="/"
        class="flex items-center gap-2 text-lg font-bold tracking-tight"
      >
        <span class="text-2xl">🍳</span>
        <span>{{ t("家庭食谱") }}</span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden items-center gap-6 text-sm font-medium md:flex">
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          class="transition-colors hover:text-[var(--color-primary)]"
          :class="
            isActive(link.href)
              ? 'font-semibold text-[var(--color-primary)]'
              : 'text-[var(--color-on-surface-muted)]'
          "
        >
          {{ t(link.label) }}
        </a>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <!-- Dark mode toggle -->
        <button
          class="rounded p-2 transition-colors hover:bg-[var(--color-surface-hover)]"
          :title="isDark ? t('白天模式') : t('黑夜模式')"
          @click="toggleDark()"
        >
          <svg
            v-if="isDark"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>

        <!-- Mobile menu toggle -->
        <button
          class="rounded p-2 transition-colors hover:bg-[var(--color-surface-hover)] md:hidden"
          @click="mobileOpen = !mobileOpen"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              v-if="!mobileOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Nav -->
    <nav
      v-if="mobileOpen"
      class="border-t border-[var(--color-border)] px-4 pt-2 pb-4 md:hidden"
    >
      <a
        v-for="link in navLinks"
        :key="link.href"
        :href="link.href"
        class="block rounded px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-hover)]"
        :class="
          isActive(link.href)
            ? 'text-[var(--color-primary)]'
            : 'text-[var(--color-on-surface-muted)]'
        "
        @click="mobileOpen = false"
      >
        {{ t(link.label) }}
      </a>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { usePageContext } from "vike-vue/usePageContext";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { useTheme } from "@/composables/useTheme";

const { t } = useI18n();
const { isDark, toggleDark } = useTheme();
const pageContext = usePageContext();
const mobileOpen = ref(false);

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/recipes", label: "食谱" },
  { href: "/admin", label: "控制面板" },
  { href: "/agent", label: "AI 助手" },
];

const isActive = (href: string) => {
  const { urlPathname } = pageContext;
  return href === "/" ? urlPathname === href : urlPathname.startsWith(href);
};
</script>
