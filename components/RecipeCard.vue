<template>
  <a
    :href="`/recipes/${recipe.id}`"
    class="block overflow-hidden rounded border border-[var(--color-border)] bg-[var(--color-surface)] transition-shadow hover:shadow-md"
  >
    <!-- Cover Image -->
    <div
      v-if="recipe.coverImage"
      class="aspect-video w-full overflow-hidden bg-[var(--color-surface-alt)]"
    >
      <img
        :src="recipe.coverImage"
        :alt="recipe.name"
        class="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
    <div
      v-else
      class="flex aspect-video w-full items-center justify-center bg-[var(--color-surface-alt)] text-4xl"
    >
      🍽️
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="text-base leading-snug font-semibold">{{ recipe.name }}</h3>
      <p
        v-if="recipe.description"
        class="mt-1 line-clamp-2 text-sm text-[var(--color-on-surface-muted)]"
      >
        {{ recipe.description }}
      </p>

      <div class="mt-3 flex flex-wrap items-center gap-2">
        <!-- Time badge -->
        <span
          v-if="recipe.estimatedTime"
          class="inline-flex items-center gap-1 text-xs text-[var(--color-on-surface-muted)]"
        >
          <svg
            class="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {{ recipe.estimatedTime }}{{ t("分钟") }}
        </span>

        <!-- Tags -->
        <span
          v-for="tag in recipe.tags"
          :key="tag.tagId"
          class="rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-xs text-[var(--color-primary)]"
        >
          {{ tag.tagName }}
        </span>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
  recipe: {
    id: string;
    name: string;
    description?: string | null;
    coverImage?: string | null;
    estimatedTime?: number | null;
    tags: { tagId: string; tagName: string }[];
  };
}>();
</script>
