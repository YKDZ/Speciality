<script setup lang="ts">
import { onKeyStroke, useFullscreen, useSwipe } from "@vueuse/core";
import { ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-vue-next";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import { ScrollArea } from "@/components/ui/scroll-area";

import MarkdownRenderer from "./MarkdownRenderer.vue";

const { t } = useI18n();

const props = defineProps<{
  steps: { id: string; content: string; sortOrder: number; name?: string }[];
  recipeName: string;
}>();

const emit = defineEmits<{
  exit: [];
}>();

const currentStep = ref(0);
const slideContainer = ref<HTMLElement | null>(null);
const scrollAreaRef = ref<InstanceType<typeof ScrollArea> | null>(null);

const { isFullscreen, toggle: toggleFullscreen } =
  useFullscreen(slideContainer);

watch(currentStep, () => {
  const viewport = scrollAreaRef.value?.$el?.querySelector(
    "[data-reka-scroll-area-viewport]",
  );
  if (viewport) viewport.scrollTop = 0;
});

const nextStep = () => {
  if (currentStep.value < props.steps.length - 1) {
    currentStep.value += 1;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value -= 1;
  }
};

useSwipe(slideContainer, {
  onSwipeEnd(_, direction) {
    if (direction === "left") nextStep();
    if (direction === "right") prevStep();
  },
});

onKeyStroke("ArrowRight", nextStep);
onKeyStroke("ArrowLeft", prevStep);
onKeyStroke("Escape", () => emit("exit"));
</script>

<template>
  <div
    ref="slideContainer"
    class="fixed inset-0 z-50 flex flex-col bg-(--color-surface)"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between border-b border-(--color-border) px-4 py-3"
    >
      <h2 class="text-lg font-semibold">{{ recipeName }}</h2>
      <div class="flex items-center gap-3">
        <span class="text-sm text-(--color-on-surface-muted)">
          {{
            t("步骤 {current}/{total}", {
              current: currentStep + 1,
              total: steps.length,
            })
          }}
        </span>
        <button
          class="rounded border border-(--color-border) p-1.5 text-sm transition-colors hover:bg-(--color-surface-hover)"
          :title="isFullscreen ? t('退出全屏') : t('全屏')"
          @click="toggleFullscreen"
        >
          <Maximize v-if="!isFullscreen" class="h-4 w-4" />
          <Minimize v-else class="h-4 w-4" />
        </button>
        <button
          class="rounded border border-(--color-border) px-3 py-1.5 text-sm transition-colors hover:bg-(--color-surface-hover)"
          @click="$emit('exit')"
        >
          {{ t("退出幻灯片") }}
        </button>
      </div>
    </div>

    <!-- Step Content -->
    <ScrollArea ref="scrollAreaRef" class="min-h-0 flex-1">
      <div class="flex min-h-full items-center justify-center p-8">
        <div class="max-w-2xl text-center">
          <div class="mb-4 text-6xl font-bold text-(--color-primary)">
            {{ currentStep + 1 }}
          </div>
          <div
            v-if="steps[currentStep]?.name"
            class="mb-2 text-sm font-medium text-(--color-on-surface-muted)"
          >
            {{ steps[currentStep].name }}
          </div>
          <MarkdownRenderer
            :content="steps[currentStep]?.content ?? ''"
            class="text-lg leading-relaxed"
          />
        </div>
      </div>
    </ScrollArea>

    <!-- Progress bar -->
    <div class="h-1 bg-(--color-surface-alt)">
      <div
        class="h-full bg-(--color-primary) transition-all duration-300"
        :style="{ width: `${((currentStep + 1) / steps.length) * 100}%` }"
      />
    </div>

    <!-- Navigation -->
    <div
      class="flex items-center justify-between border-t border-(--color-border) px-4 py-3"
    >
      <button
        class="inline-flex items-center gap-1.5 rounded border border-(--color-border) px-4 py-2 text-sm transition-colors hover:bg-(--color-surface-hover) disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="currentStep === 0"
        @click="prevStep"
      >
        <ChevronLeft class="h-4 w-4" />
        {{ t("上一步") }}
      </button>
      <button
        class="inline-flex items-center gap-1.5 rounded bg-(--color-primary) px-4 py-2 text-sm font-semibold text-(--color-on-primary) transition-colors hover:bg-(--color-primary-hover) disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="currentStep === steps.length - 1"
        @click="nextStep"
      >
        {{ t("下一步") }}
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
