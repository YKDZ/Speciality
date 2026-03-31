<script setup lang="ts">
import { useData } from "vike-vue/useData";
import { navigate } from "vike/client/router";
import { useI18n } from "vue-i18n";

import ComboForm from "@/components/ComboForm.vue";
import { Button } from "@/components/ui/button";

import type { Data } from "./+data";

import { onUpdateCombo, onUpsertComboRecipes } from "./+Page.telefunc";

const { t } = useI18n();
const data = useData<Data>();

const initialData = {
  name: data.combo.name,
  description: data.combo.description ?? "",
  estimatedTime: data.combo.estimatedTime ?? null,
  coverImage: data.combo.coverImage ?? "",
  selectedRecipeIds: data.comboRecipes.map((r) => r.id),
};

const handleSave = async (formData: {
  name: string;
  description: string;
  estimatedTime: number | null;
  coverImage: string;
  selectedRecipeIds: string[];
}) => {
  await onUpdateCombo(data.combo.id, {
    name: formData.name,
    description: formData.description || undefined,
    estimatedTime: formData.estimatedTime ?? undefined,
    coverImage: formData.coverImage || undefined,
  });
  await onUpsertComboRecipes(
    data.combo.id,
    formData.selectedRecipeIds.map((id, idx) => ({
      recipeId: id,
      sortOrder: idx,
    })),
  );
  await navigate(`/combos/${data.combo.id}`);
};
</script>

<template>
  <div class="container mx-auto max-w-2xl px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t("编辑搭配") }}</h1>
      <Button
        as="a"
        :href="`/combos/${data.combo.id}`"
        variant="ghost"
        size="sm"
      >
        {{ t("取消") }}
      </Button>
    </div>
    <ComboForm
      :all-recipes="data.allRecipes"
      :initial-data="initialData"
      @save="handleSave"
    />
  </div>
</template>
