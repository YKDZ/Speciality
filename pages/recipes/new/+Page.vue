<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">{{ t("新建食谱") }}</h1>
      <a
        href="/recipes"
        class="text-sm text-on-surface-muted hover:text-primary"
      >
        {{ t("取消") }}
      </a>
    </div>

    <RecipeForm
      :all-ingredients="allIngredients"
      :all-tags="allTags"
      @save="onSave"
    />
  </div>
</template>

<script setup lang="ts">
import { useData } from "vike-vue/useData";
import { navigate } from "vike/client/router";
import { useI18n } from "vue-i18n";

import RecipeForm from "@/components/RecipeForm.vue";

import type { Data } from "./+data";

const { t } = useI18n();
const { allIngredients, allTags } = useData<Data>();

const onSave = async (formData: {
  name: string;
  description: string;
  estimatedTime?: number;
  coverImage: string;
  video: string;
  steps: { content: string; sortOrder: number }[];
  tagIds: string[];
  ingredients: { ingredientId: string; amount?: string; note?: string }[];
}) => {
  const {
    onCreateRecipe,
    onUpsertSteps,
    onUpsertRecipeTags,
    onUpsertRecipeIngredients,
  } = await import("../recipes.telefunc");

  const recipe = await onCreateRecipe({
    name: formData.name,
    description: formData.description || undefined,
    estimatedTime: formData.estimatedTime || undefined,
    coverImage: formData.coverImage || undefined,
    video: formData.video || undefined,
  });

  if (formData.steps.length > 0) {
    await onUpsertSteps(recipe.id, formData.steps);
  }
  if (formData.tagIds.length > 0) {
    await onUpsertRecipeTags(recipe.id, formData.tagIds);
  }
  if (formData.ingredients.length > 0) {
    await onUpsertRecipeIngredients(recipe.id, formData.ingredients);
  }

  await navigate(`/recipes/${recipe.id}`);
};
</script>
