<template>
  <div class="flex flex-col items-center py-20 text-center">
    <span class="text-6xl">{{ is404 ? "🔍" : "⚠️" }}</span>
    <h1 class="mt-4 text-3xl font-bold">{{ heading }}</h1>
    <p class="mt-2 text-on-surface-muted">{{ abortReason }}</p>
    <a
      href="/"
      class="mt-6 inline-flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)]"
    >
      {{ t("返回") }}
    </a>
  </div>
</template>

<script lang="ts" setup>
import { usePageContext } from "vike-vue/usePageContext";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const pageContext = usePageContext();
let { is404, abortReason } = pageContext;
if (!abortReason) {
  abortReason = is404 ? t("— 页面不存在") : t("发生了错误");
}
const heading = is404 ? "404" : "500";
</script>
