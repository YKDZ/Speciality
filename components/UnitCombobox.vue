<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxRoot,
} from "reka-ui";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import { ScrollArea } from "@/components/ui/scroll-area";

const props = defineProps<{
  modelValue: string | undefined;
  units: string[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string | undefined];
}>();

const { t } = useI18n();
const open = ref(false);
const search = ref(props.modelValue ?? "");

watch(
  () => props.modelValue,
  (v) => {
    search.value = v ?? "";
  },
);

const selected = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const filteredUnits = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return props.units;
  return props.units.filter((u) => u.toLowerCase().includes(q));
});

const commitFreeText = () => {
  const v = search.value.trim();
  if (v && v !== props.modelValue) {
    emit("update:modelValue", v || undefined);
  }
};
</script>

<template>
  <ComboboxRoot
    v-model="selected"
    v-model:open="open"
    open-on-focus
    open-on-click
    class="relative"
  >
    <ComboboxAnchor class="relative block w-full">
      <ComboboxInput
        v-model="search"
        :placeholder="t('单位')"
        class="w-full rounded border border-(--color-border) bg-(--color-surface) py-2 pr-8 pl-3 text-sm outline-none focus:border-(--color-primary)"
        @blur="commitFreeText"
      />
      <ChevronDown
        class="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-(--color-on-surface-muted)"
      />
    </ComboboxAnchor>

    <ComboboxContent
      class="absolute z-50 mt-1 w-40 rounded border border-(--color-border) bg-popover shadow-md"
    >
      <ScrollArea
        class="max-h-48 [&>[data-slot=scroll-area-viewport]]:max-h-[inherit]"
      >
        <div class="p-1">
          <ComboboxItem
            v-for="unit in filteredUnits"
            :key="unit"
            :value="unit"
            class="cursor-pointer rounded px-2 py-1.5 text-sm outline-none hover:bg-accent data-highlighted:bg-accent"
          >
            {{ unit }}
          </ComboboxItem>
          <ComboboxEmpty class="px-2 py-1.5 text-sm text-muted-foreground">
            {{ t("按回车确认") }}
          </ComboboxEmpty>
        </div>
      </ScrollArea>
    </ComboboxContent>
  </ComboboxRoot>
</template>
