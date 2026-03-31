<script setup lang="ts">
import { Check, ChevronDown, X } from "lucide-vue-next";
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

import type { Tag } from "@/database/drizzle/schema/tags";

import { ScrollArea } from "@/components/ui/scroll-area";

import Badge from "./ui/badge/Badge.vue";
import Button from "./ui/button/Button.vue";

const props = defineProps<{
  modelValue: string[];
  tags: Tag[];
}>();

const emit = defineEmits<{
  create: [name: string];
  "update:modelValue": [value: string[]];
}>();

const { t } = useI18n();
const open = ref(false);
const searchQuery = ref("");

const selectedIds = computed({
  get: () => props.modelValue,
  set: (value: string[]) => {
    emit("update:modelValue", value);
  },
});

const selectedTags = computed(() =>
  props.tags.filter((tag) => props.modelValue.includes(tag.id)),
);

const normalizedSearch = computed(() => searchQuery.value.trim());

const tagExists = computed(() => {
  const loweredQuery = normalizedSearch.value.toLowerCase();
  return props.tags.some(
    (tag) => tag.name.trim().toLowerCase() === loweredQuery,
  );
});

const removeTag = (tagId: string) => {
  emit(
    "update:modelValue",
    props.modelValue.filter((value) => value !== tagId),
  );
};

const handleCreate = () => {
  if (!normalizedSearch.value) {
    return;
  }

  emit("create", normalizedSearch.value);
  searchQuery.value = "";
  open.value = false;
};
</script>

<template>
  <div class="space-y-3">
    <div v-if="selectedTags.length > 0" class="flex flex-wrap gap-1.5">
      <Badge
        variant="outline"
        @click="removeTag(tag.id)"
        v-for="tag in selectedTags"
        :key="tag.id"
      >
        {{ tag.name }}
        <X />
      </Badge>
    </div>

    <ComboboxRoot
      v-model="selectedIds"
      v-model:open="open"
      multiple
      open-on-focus
      open-on-click
      class="relative"
    >
      <ComboboxAnchor class="relative block">
        <ComboboxInput
          v-model="searchQuery"
          :placeholder="t('搜索标签...')"
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
          class="max-h-60 *:data-[slot=scroll-area-viewport]:max-h-[inherit]"
        >
          <div class="p-1">
            <ComboboxItem
              v-for="tag in tags"
              :key="tag.id"
              :value="tag.id"
              class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none hover:bg-accent data-highlighted:bg-accent"
            >
              <div
                class="flex h-4 w-4 items-center justify-center rounded border border-(--color-border)"
              >
                <Check v-if="modelValue.includes(tag.id)" class="h-3 w-3" />
              </div>
              <span>{{ tag.name }}</span>
            </ComboboxItem>
            <ComboboxEmpty class="px-2 py-1.5 text-sm text-muted-foreground">
              {{ t("无匹配标签") }}
            </ComboboxEmpty>
          </div>
        </ScrollArea>
      </ComboboxContent>
    </ComboboxRoot>

    <Button
      v-if="normalizedSearch && !tagExists"
      type="button"
      variant="outline"
      @click="handleCreate"
    >
      + {{ t("创建标签 {name}", { name: normalizedSearch }) }}
    </Button>
  </div>
</template>
