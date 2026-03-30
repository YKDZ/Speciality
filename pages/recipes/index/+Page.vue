<script setup lang="ts">
import { Plus, Search } from "lucide-vue-next";
import { useData } from "vike-vue/useData";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import RecipeCard from "@/components/RecipeCard.vue";
import { Skeleton } from "@/components/ui/skeleton";

import type { Data } from "./+data";

import { onSearchRecipes } from "./+Page.telefunc";

const { t } = useI18n();
const { recipes, tags: allTags } = useData<Data>();

const searchQuery = ref("");
const selectedTag = ref<string | null>(null);
const searchResults = ref<typeof recipes | null>(null);
const isLoading = ref(false);

const toggleTag = (tagId: string) => {
  selectedTag.value = selectedTag.value === tagId ? null : tagId;
};

const filteredRecipes = computed(() => {
  let list = searchResults.value ?? recipes;

  if (selectedTag.value) {
    list = list.filter((r) =>
      r.tags.some((t) => t.tagId === selectedTag.value),
    );
  }

  return list;
});

const onSearch = async () => {
  const q = searchQuery.value.trim();
  if (!q) {
    searchResults.value = null;
    return;
  }
  isLoading.value = true;
  try {
    const results = await onSearchRecipes(q);
    // Re-enrich with tags from local data
    searchResults.value = results.map((r) => {
      const existing = recipes.find((orig) => orig.id === r.id);
      return { ...r, tags: existing?.tags ?? [] };
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <!-- Search & Actions Bar -->
    <div
      class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-3xl font-bold tracking-tight">{{ t("食谱") }}</h1>
      <div class="flex items-center gap-3">
        <div class="relative flex-1 sm:w-64 sm:flex-initial">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('搜索食谱...')"
            class="w-full rounded border border-(--color-border) bg-(--color-surface) px-3 py-2 pl-9 text-sm transition-colors outline-none placeholder:text-(--color-on-surface-muted) focus:border-(--color-primary)"
            @input="onSearch"
          />
          <Search
            class="absolute top-2.5 left-2.5 h-4 w-4 text-(--color-on-surface-muted)"
          />
        </div>
        <a
          href="/recipes/new"
          class="inline-flex shrink-0 items-center gap-1.5 rounded bg-(--color-primary) px-4 py-2 text-sm font-semibold text-(--color-on-primary) transition-colors hover:bg-(--color-primary-hover)"
        >
          <Plus class="h-4 w-4" />
          {{ t("新建食谱") }}
        </a>
      </div>
    </div>

    <!-- Tag filters -->
    <div v-if="allTags.length > 0" class="mb-6 flex flex-wrap gap-2">
      <button
        v-for="tag in allTags"
        :key="tag.id"
        class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
        :class="
          selectedTag === tag.id
            ? 'border-(--color-primary) bg-(--color-primary-light) text-(--color-primary)'
            : 'border-(--color-border) text-(--color-on-surface-muted) hover:border-(--color-primary) hover:text-(--color-primary)'
        "
        @click="toggleTag(tag.id)"
      >
        {{ tag.name }}
      </button>
    </div>

    <!-- Recipe count -->
    <p class="mb-4 text-sm text-(--color-on-surface-muted)">
      {{ t("共 {count} 个食谱", { count: filteredRecipes.length }) }}
    </p>

    <!-- Skeleton placeholders while loading -->
    <div v-if="isLoading" class="columns-1 gap-4 sm:columns-2 lg:columns-3">
      <div
        v-for="i in 6"
        :key="i"
        class="mb-4 break-inside-avoid overflow-hidden rounded-lg border"
      >
        <Skeleton class="aspect-video w-full" />
        <div class="p-4">
          <Skeleton class="h-5 w-3/4" />
          <Skeleton class="mt-2 h-4 w-full" />
          <Skeleton class="mt-1 h-4 w-2/3" />
          <div class="mt-3 flex gap-2">
            <Skeleton class="h-5 w-16 rounded-full" />
            <Skeleton class="h-5 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredRecipes.length === 0" class="py-20 text-center">
      <span class="text-5xl">📖</span>
      <p class="mt-4 text-lg text-(--color-on-surface-muted)">
        {{ t("暂无食谱") }}
      </p>
      <a
        href="/recipes/new"
        class="mt-4 inline-flex items-center gap-2 rounded bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-(--color-on-primary) transition-colors hover:bg-(--color-primary-hover)"
      >
        {{ t("新建食谱") }}
      </a>
    </div>

    <!-- Masonry / Waterfall Grid -->
    <div v-else class="columns-1 gap-4 sm:columns-2 lg:columns-3">
      <RecipeCard
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        :recipe="recipe"
        class="mb-4 break-inside-avoid"
      />
    </div>
  </div>
</template>
