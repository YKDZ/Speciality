<script setup lang="ts">
import { useDebounceFn, useIntersectionObserver } from "@vueuse/core";
import { Search } from "lucide-vue-next";
import { useData } from "vike-vue/useData";
import { navigate } from "vike/client/router";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import RecipeCard from "@/components/RecipeCard.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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

const hasMore = ref(allRecipes.value.length < searchTotal.value);
watch([allRecipes, searchTotal], () => {
  hasMore.value = allRecipes.value.length < searchTotal.value;
});

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
    <!-- Search & Actions Bar -->
    <div
      class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-3xl font-bold tracking-tight">{{ t("食谱") }}</h1>
      <div class="flex items-center gap-3">
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
    </div>

    <!-- Tag filters -->
    <div v-if="allTags.length > 0" class="mb-6 flex flex-wrap gap-2">
      <Badge
        v-for="tag in allTags"
        :key="tag.id"
        variant="outline"
        class="cursor-pointer select-none"
        :class="
          selectedTags.has(tag.id)
            ? 'border-(--color-primary) bg-(--color-primary-light) text-(--color-primary)'
            : ''
        "
        @click="toggleTag(tag.id)"
      >
        {{ tag.name }}
      </Badge>
    </div>

    <!-- Skeleton placeholders while loading -->
    <div
      v-if="isLoading && allRecipes.length === 0"
      class="columns-1 gap-4 sm:columns-2 lg:columns-3"
    >
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

    <!-- Recipe waterfall -->
    <div
      v-else-if="allRecipes.length > 0"
      class="columns-1 gap-4 sm:columns-2 lg:columns-3"
    >
      <RecipeCard
        v-for="recipe in allRecipes"
        :key="recipe.id"
        :recipe="recipe"
        class="mb-4 break-inside-avoid"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="py-20 text-center">
      <span class="text-5xl">📖</span>
      <p class="mt-4 text-lg text-(--color-on-surface-muted)">
        {{ t("暂无食谱") }}
      </p>
      <Button @click="navigate('/recipe/new')">
        {{ t("新建食谱") }}
      </Button>
    </div>

    <!-- Sentinel + loading indicator -->
    <div ref="sentinelRef" class="flex justify-center py-8">
      <div v-if="isLoading" class="text-sm text-(--color-on-surface-muted)">
        {{ t("加载中...") }}
      </div>
    </div>
  </div>
</template>
