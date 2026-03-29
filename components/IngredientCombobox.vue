<script setup lang="ts">
import { Check, ChevronDown } from "lucide-vue-next";
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxRoot,
} from "reka-ui";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import type { Ingredient } from "@/database/drizzle/schema/ingredients";

import { ScrollArea } from "@/components/ui/scroll-area";

const props = defineProps<{
  modelValue: string;
  ingredients: Ingredient[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const { t } = useI18n();
const open = ref(false);
const searchQuery = ref("");

const selectedIngredientId = computed({
  get: () => props.modelValue,
  set: (value: string | undefined) => {
    emit("update:modelValue", value ?? "");
  },
});

const displayIngredientName = (value: string | string[]) => {
  if (typeof value !== "string") {
    return "";
  }

  return (
    props.ingredients.find((ingredient) => ingredient.id === value)?.name ?? ""
  );
};
</script>

<template>
  <ComboboxRoot
    v-model="selectedIngredientId"
    v-model:open="open"
    open-on-focus
    open-on-click
    class="relative"
  >
    <ComboboxAnchor class="relative block w-full">
      <ComboboxInput
        v-model="searchQuery"
        :placeholder="t('搜索食材...')"
        :display-value="displayIngredientName"
        class="w-full rounded border border-(--color-border) bg-(--color-surface) py-2 pr-10 pl-3 text-sm outline-none focus:border-(--color-primary)"
      />
      <ChevronDown
        class="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-(--color-on-surface-muted)"
      />
    </ComboboxAnchor>

    <ComboboxContent
      class="absolute z-50 mt-1 w-full rounded border border-(--color-border) bg-popover shadow-md"
    >
      <ScrollArea
        class="max-h-48 [&>[data-slot=scroll-area-viewport]]:max-h-[inherit]"
      >
        <div class="p-1">
          <ComboboxItem
            v-for="ingredient in ingredients"
            :key="ingredient.id"
            :value="ingredient.id"
            class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none hover:bg-accent"
          >
            <Check
              :class="
                ingredient.id === modelValue ? 'opacity-100' : 'opacity-0'
              "
              class="h-4 w-4 text-primary"
            />
            <span>{{ ingredient.name }}</span>
          </ComboboxItem>
          <ComboboxEmpty class="px-2 py-1.5 text-sm text-muted-foreground">
            {{ t("无匹配食材") }}
          </ComboboxEmpty>
        </div>
      </ScrollArea>
    </ComboboxContent>
  </ComboboxRoot>
</template>
