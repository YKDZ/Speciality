<template>
  <div
    class="fixed inset-0 z-50 flex flex-col bg-[var(--color-surface)]"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3"
    >
      <h2 class="text-lg font-semibold">{{ recipeName }}</h2>
      <div class="flex items-center gap-3">
        <span class="text-sm text-[var(--color-on-surface-muted)]">
          {{
            t("步骤 {current}/{total}", {
              current: currentStep + 1,
              total: steps.length,
            })
          }}
        </span>
        <button
          class="rounded border border-[var(--color-border)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-hover)]"
          @click="$emit('exit')"
        >
          {{ t("退出幻灯片") }}
        </button>
      </div>
    </div>

    <!-- Step Content -->
    <div class="flex flex-1 items-center justify-center overflow-auto p-8">
      <div class="max-w-2xl text-center">
        <div class="mb-4 text-6xl font-bold text-[var(--color-primary)]">
          {{ currentStep + 1 }}
        </div>
        <div
          class="text-lg leading-relaxed whitespace-pre-wrap"
          v-text="steps[currentStep]?.content"
        />
      </div>
    </div>

    <!-- Progress bar -->
    <div class="h-1 bg-[var(--color-surface-alt)]">
      <div
        class="h-full bg-[var(--color-primary)] transition-all duration-300"
        :style="{ width: `${((currentStep + 1) / steps.length) * 100}%` }"
      />
    </div>

    <!-- Navigation -->
    <div
      class="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3"
    >
      <button
        class="inline-flex items-center gap-1.5 rounded border border-[var(--color-border)] px-4 py-2 text-sm transition-colors hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="currentStep === 0"
        @click="prev"
      >
        <svg
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {{ t("上一步") }}
      </button>
      <button
        class="inline-flex items-center gap-1.5 rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="currentStep === steps.length - 1"
        @click="next"
      >
        {{ t("下一步") }}
        <svg
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  steps: { id: string; content: string; sortOrder: number }[];
  recipeName: string;
}>();

defineEmits<{
  exit: [];
}>();

const currentStep = ref(0);
let touchStartX = 0;

const next = () => {
  if (currentStep.value < props.steps.length - 1) {
    currentStep.value += 1;
  }
};

const prev = () => {
  if (currentStep.value > 0) {
    currentStep.value -= 1;
  }
};

const onTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
};

const onTouchEnd = (e: TouchEvent) => {
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) > 50) {
    if (delta < 0) next();
    else prev();
  }
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "ArrowRight" || e.key === " ") next();
  else if (e.key === "ArrowLeft") prev();
  else if (e.key === "Escape") {
    // handled by parent
  }
};

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
});
</script>
