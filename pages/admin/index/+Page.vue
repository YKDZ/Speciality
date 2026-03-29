<script setup lang="ts">
import { useData } from "vike-vue/useData";
import { useI18n } from "vue-i18n";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Data } from "./+data";

import AdminCombosTab from "./AdminCombosTab.vue";
import AdminIngredientsTab from "./AdminIngredientsTab.vue";
import AdminRecipesTab from "./AdminRecipesTab.vue";
import AdminTagsTab from "./AdminTagsTab.vue";

const { t } = useI18n();
const { recipes, ingredients, tags, combos } = useData<Data>();
</script>

<template>
  <div>
    <h1 class="mb-6 text-3xl font-bold tracking-tight">{{ t("控制面板") }}</h1>
    <Tabs default-value="recipes">
      <TabsList>
        <TabsTrigger value="recipes">{{ t("食谱") }}</TabsTrigger>
        <TabsTrigger value="combos">{{ t("搭配") }}</TabsTrigger>
        <TabsTrigger value="ingredients">{{ t("食材") }}</TabsTrigger>
        <TabsTrigger value="tags">{{ t("标签") }}</TabsTrigger>
      </TabsList>
      <TabsContent value="recipes">
        <AdminRecipesTab :recipes="recipes" />
      </TabsContent>
      <TabsContent value="combos">
        <AdminCombosTab :combos="combos" />
      </TabsContent>
      <TabsContent value="ingredients">
        <AdminIngredientsTab :ingredients="ingredients" />
      </TabsContent>
      <TabsContent value="tags">
        <AdminTagsTab :tags="tags" />
      </TabsContent>
    </Tabs>
  </div>
</template>
