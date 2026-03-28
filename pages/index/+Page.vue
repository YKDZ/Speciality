<template>
  <div class="flex flex-col items-center py-12 text-center">
    <span class="text-6xl">🍳</span>
    <h1 class="mt-4 text-4xl font-bold tracking-tight">{{ t("家庭食谱") }}</h1>
    <p class="mt-3 max-w-lg text-lg text-[var(--color-on-surface-muted)]">
      {{ t("记录和分享家庭美味，让每一道菜都有迹可循") }}
    </p>

    <div class="mt-8 flex flex-wrap justify-center gap-4">
      <a
        href="/recipes"
        class="inline-flex items-center gap-2 rounded bg-[var(--color-primary)] px-6 py-3 font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)]"
      >
        {{ t("浏览食谱") }}
      </a>
      <a
        href="/recipes/new"
        class="inline-flex items-center gap-2 rounded border border-[var(--color-border)] px-6 py-3 font-semibold transition-colors hover:bg-[var(--color-surface-hover)]"
      >
        {{ t("新建食谱") }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
