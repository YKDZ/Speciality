<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">{{ t("编辑食谱") }}</h1>
      <a
        :href="`/recipes/${recipe.id}`"
        class="text-sm text-[var(--color-on-surface-muted)] hover:text-[var(--color-primary)]"
      >
        {{ t("取消") }}
      </a>
    </div>

    <RecipeForm
      :initial-data="{
        name: recipe.name,
        description: recipe.description ?? '',
        estimatedTime: recipe.estimatedTime ?? undefined,
        coverImage: recipe.coverImage ?? '',
        video: recipe.video ?? '',
        steps: steps.map((s) => ({
          content: s.content,
          sortOrder: s.sortOrder,
        })),
        tagIds: recipeTags.map((t) => t.tagId),
        ingredients: ingredients.map((i) => ({
          ingredientId: i.ingredientId,
          amount: i.amount ?? '',
          note: i.note ?? '',
        })),
      }"
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
const { recipe, steps, ingredients, recipeTags, allIngredients, allTags } =
  useData<Data>();

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
    onUpdateRecipe,
    onUpsertSteps,
    onUpsertRecipeTags,
    onUpsertRecipeIngredients,
  } = await import("../../recipes.telefunc");

  await onUpdateRecipe(recipe.id, {
    name: formData.name,
    description: formData.description || undefined,
    estimatedTime: formData.estimatedTime || undefined,
    coverImage: formData.coverImage || undefined,
    video: formData.video || undefined,
  });

  await onUpsertSteps(recipe.id, formData.steps);
  await onUpsertRecipeTags(recipe.id, formData.tagIds);
  await onUpsertRecipeIngredients(recipe.id, formData.ingredients);

  await navigate(`/recipes/${recipe.id}`);
};
</script>
