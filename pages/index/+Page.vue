<script setup lang="ts">
import { useDebounceFn, useIntersectionObserver } from "@vueuse/core";
import { Search } from "lucide-vue-next";
import { useData } from "vike-vue/useData";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import RecipeCard from "@/components/RecipeCard.vue";
import { Input } from "@/components/ui/input";

import type { Data } from "./+data";

import {
  onGetRecipesByTagsPaginated,
  onGetRecipesPaginated,
  onSearchRecipesPaginated,
} from "./+Page.telefunc";

const { t } = useI18n();
const {
  recipes: initialRecipes,
  tags: allTags,
  total,
  pageSize,
} = useData<Data>();

type EnrichedRecipe = (typeof initialRecipes)[number];

const allRecipes = ref<EnrichedRecipe[]>([...initialRecipes]);
const isLoading = ref(false);
const searchTotal = ref(total);

const searchQuery = ref("");
const selectedTags = ref(new Set<string>());
const sentinelRef = ref<HTMLElement | null>(null);

const hasMore = computed(() => allRecipes.value.length < searchTotal.value);

const toggleTag = (tagId: string) => {
  const next = new Set(selectedTags.value);
  if (next.has(tagId)) next.delete(tagId);
  else next.add(tagId);
  selectedTags.value = next;
};

const loadMore = async () => {
  if (isLoading.value || !hasMore.value) return;
  isLoading.value = true;
  const offset = allRecipes.value.length;
  try {
    if (selectedTags.value.size > 0) {
      const { recipes, total: t } = await onGetRecipesByTagsPaginated(
        [...selectedTags.value],
        offset,
        pageSize,
      );
      allRecipes.value.push(...(recipes as EnrichedRecipe[]));
      searchTotal.value = t;
    } else if (searchQuery.value.trim()) {
      const { recipes, total: t } = await onSearchRecipesPaginated(
        searchQuery.value,
        offset,
        pageSize,
      );
      allRecipes.value.push(...(recipes as EnrichedRecipe[]));
      searchTotal.value = t;
    } else {
      const { recipes } = await onGetRecipesPaginated(offset, pageSize);
      allRecipes.value.push(...(recipes as EnrichedRecipe[]));
    }
  } finally {
    isLoading.value = false;
  }
};

const debouncedSearch = useDebounceFn(async (query: string) => {
  isLoading.value = true;
  allRecipes.value = [];
  try {
    if (!query.trim()) {
      const { recipes, total: t } = await onGetRecipesPaginated(0, pageSize);
      allRecipes.value = recipes as EnrichedRecipe[];
      searchTotal.value = t;
    } else {
      const { recipes, total: t } = await onSearchRecipesPaginated(
        query,
        0,
        pageSize,
      );
      allRecipes.value = recipes as EnrichedRecipe[];
      searchTotal.value = t;
    }
  } finally {
    isLoading.value = false;
  }
}, 300);

const onSearchInput = () => debouncedSearch(searchQuery.value);

watch(
  selectedTags,
  async (tags) => {
    isLoading.value = true;
    allRecipes.value = [];
    try {
      if (tags.size === 0) {
        const { recipes, total: t } = await onGetRecipesPaginated(0, pageSize);
        allRecipes.value = recipes as EnrichedRecipe[];
        searchTotal.value = t;
      } else {
        const { recipes, total: t } = await onGetRecipesByTagsPaginated(
          [...tags],
          0,
          pageSize,
        );
        allRecipes.value = recipes as EnrichedRecipe[];
        searchTotal.value = t;
      }
    } finally {
      isLoading.value = false;
    }
  },
  { deep: true },
);

useIntersectionObserver(sentinelRef, ([entry]) => {
  if (entry?.isIntersecting) loadMore();
});
</script>

<template>
  <div>
    <!-- 搜索栏 + 标签过滤 -->
    <div class="mb-6 flex flex-wrap items-center gap-3">
      <div class="relative flex-1 sm:w-64 sm:flex-initial">
        <Input
          v-model="searchQuery"
          type="text"
          :placeholder="t('搜索食谱...')"
          class="pl-9"
          @input="onSearchInput"
        />
        <Search
          class="absolute top-2.5 left-2.5 h-4 w-4 text-(--color-on-surface-muted)"
        />
      </div>
    </div>

    <!-- Tag filters -->
    <div v-if="allTags.length > 0" class="mb-6 flex flex-wrap gap-2">
      <button
        v-for="tag in allTags"
        :key="tag.id"
        class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
        :class="
          selectedTags.has(tag.id)
            ? 'border-(--color-primary) bg-(--color-primary-light) text-(--color-primary)'
            : 'border-(--color-border) text-(--color-on-surface-muted) hover:border-(--color-primary) hover:text-(--color-primary)'
        "
        @click="toggleTag(tag.id)"
      >
        {{ tag.name }}
      </button>
    </div>

    <!-- Recipe waterfall -->
    <div
      v-if="allRecipes.length > 0"
      class="columns-1 gap-4 sm:columns-2 lg:columns-3"
    >
      <RecipeCard
        v-for="recipe in allRecipes"
        :key="recipe.id"
        :recipe="recipe"
        class="mb-4 break-inside-avoid"
      />
    </div>
    <div v-else class="py-20 text-center">
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

    <!-- Sentinel + loading indicator -->
    <div ref="sentinelRef" class="flex justify-center py-8">
      <div v-if="isLoading" class="text-sm text-(--color-on-surface-muted)">
        {{ t("加载中...") }}
      </div>
    </div>
  </div>
</template>
