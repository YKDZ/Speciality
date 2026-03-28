<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="$emit('cancel')"
  >
    <div
      class="mx-4 w-full max-w-sm rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg"
    >
      <p class="mb-4 text-sm">{{ message }}</p>
      <div class="flex justify-end gap-2">
        <button
          class="rounded border border-[var(--color-border)] px-4 py-2 text-sm transition-colors hover:bg-[var(--color-surface-hover)]"
          @click="$emit('cancel')"
        >
          {{ t("取消") }}
        </button>
        <button
          class="rounded bg-[var(--color-danger)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-danger-hover)]"
          @click="$emit('confirm')"
        >
          {{ t("确认") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
  message: string;
}>();

defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>
