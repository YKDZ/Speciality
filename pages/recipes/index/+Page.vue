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
            class="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 pl-9 text-sm transition-colors outline-none placeholder:text-[var(--color-on-surface-muted)] focus:border-[var(--color-primary)]"
            @input="onSearch"
          />
          <svg
            class="absolute top-2.5 left-2.5 h-4 w-4 text-[var(--color-on-surface-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <a
          href="/recipes/new"
          class="inline-flex shrink-0 items-center gap-1.5 rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)]"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
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
            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
            : 'border-[var(--color-border)] text-[var(--color-on-surface-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
        "
        @click="toggleTag(tag.id)"
      >
        {{ tag.name }}
      </button>
    </div>

    <!-- Recipe count -->
    <p class="mb-4 text-sm text-[var(--color-on-surface-muted)]">
      {{ t("共 {count} 个食谱", { count: filteredRecipes.length }) }}
    </p>

    <!-- Empty state -->
    <div v-if="filteredRecipes.length === 0" class="py-20 text-center">
      <span class="text-5xl">📖</span>
      <p class="mt-4 text-lg text-[var(--color-on-surface-muted)]">
        {{ t("暂无食谱") }}
      </p>
      <a
        href="/recipes/new"
        class="mt-4 inline-flex items-center gap-2 rounded bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)]"
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

<script setup lang="ts">
import { useData } from "vike-vue/useData";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import RecipeCard from "@/components/RecipeCard.vue";

import type { Data } from "./+data";

const { t } = useI18n();
const { recipes, tags: allTags } = useData<Data>();

const searchQuery = ref("");
const selectedTag = ref<string | null>(null);
const searchResults = ref<typeof recipes | null>(null);

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
  const { onSearchRecipes } = await import("../recipes.telefunc");
  const results = await onSearchRecipes(q);
  // Re-enrich with tags from local data
  searchResults.value = results.map((r) => {
    const existing = recipes.find((orig) => orig.id === r.id);
    return { ...r, tags: existing?.tags ?? [] };
  });
};
</script>
