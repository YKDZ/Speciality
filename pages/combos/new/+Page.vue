<script setup lang="ts">
import { useData } from "vike-vue/useData";
import { navigate } from "vike/client/router";
import { useI18n } from "vue-i18n";

import ComboForm from "@/components/ComboForm.vue";

import type { Data } from "./+data";

import { onCreateCombo, onUpsertComboRecipes } from "./+Page.telefunc";

const { t } = useI18n();
const data = useData<Data>();

const handleSave = async (formData: {
  name: string;
  description: string;
  estimatedTime: number | null;
  coverImage: string;
  selectedRecipeIds: string[];
}) => {
  const combo = await onCreateCombo({
    name: formData.name,
    description: formData.description || undefined,
    estimatedTime: formData.estimatedTime ?? undefined,
    coverImage: formData.coverImage || undefined,
  });
  if (combo && formData.selectedRecipeIds.length > 0) {
    await onUpsertComboRecipes(
      combo.id,
      formData.selectedRecipeIds.map((id, idx) => ({
        recipeId: id,
        sortOrder: idx,
      })),
    );
  }
  await navigate(`/combos/${combo.id}`);
};
</script>

<template>
  <div class="container mx-auto max-w-2xl px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t("新建搭配") }}</h1>
      <a
        href="/combos"
        class="text-sm text-muted-foreground hover:text-primary"
      >
        {{ t("取消") }}
      </a>
    </div>
    <ComboForm :all-recipes="data.allRecipes" @save="handleSave" />
  </div>
</template>
