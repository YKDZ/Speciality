<script setup lang="ts">
import { useData } from "vike-vue/useData";
import { navigate } from "vike/client/router";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import type { ShoppingItem } from "@/components/ShoppingList.vue";

import RecipeCard from "@/components/RecipeCard.vue";
import ShoppingList from "@/components/ShoppingList.vue";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Data } from "./+data";

import { onDeleteCombo } from "./+Page.telefunc";

const { t } = useI18n();
const data = useData<Data>();

const shoppingListOpen = ref(false);

const handleDelete = async () => {
  await onDeleteCombo(data.combo.id);
  await navigate("/combos");
};

const shoppingItems = computed<ShoppingItem[]>(() =>
  data.ingredients.map((ing) => ({
    ingredientId: ing.ingredientId,
    ingredientName: ing.ingredientName,
    quantity: ing.quantity ?? undefined,
    unit: ing.unit ?? undefined,
    note: ing.note ?? undefined,
    recipeName: ing.recipeName,
  })),
);
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">{{ data.combo.name }}</h1>
        <p v-if="data.combo.description" class="mt-1 text-muted-foreground">
          {{ data.combo.description }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          v-if="data.ingredients.length > 0"
          variant="outline"
          @click="shoppingListOpen = true"
        >
          {{ t("采购表") }}
        </Button>
        <Button variant="outline" as-child>
          <a :href="`/combos/${data.combo.id}/edit`">{{ t("编辑搭配") }}</a>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger as-child>
            <Button variant="destructive">{{ t("删除") }}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{{ t("确认删除此搭配？") }}</AlertDialogTitle>
              <AlertDialogDescription>{{
                data.combo.name
              }}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{{ t("取消") }}</AlertDialogCancel>
              <AlertDialogAction @click="handleDelete">{{
                t("删除")
              }}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>

    <div
      class="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
    >
      <span v-if="data.totalTime">
        {{ t("总时长：{time} 分钟", { time: data.totalTime }) }}
        <span v-if="!data.combo.estimatedTime" class="text-xs opacity-70"
          >({{ t("自动计算") }})</span
        >
        <span v-else class="text-xs opacity-70">({{ t("手动指定") }})</span>
      </span>
      <span>{{ t("包含食谱") }}: {{ data.recipes.length }}</span>
    </div>

    <h2 class="mb-4 text-xl font-semibold">{{ t("包含食谱") }}</h2>
    <div v-if="data.recipes.length === 0" class="text-muted-foreground">
      {{ t("暂无食谱") }}
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2">
      <RecipeCard
        v-for="recipe in data.recipes"
        :key="recipe.id"
        :recipe="{ ...recipe, tags: [] }"
      />
    </div>

    <!-- Shopping List Dialog -->
    <Dialog
      :open="shoppingListOpen"
      @update:open="(v) => !v && (shoppingListOpen = false)"
    >
      <DialogContent class="flex max-h-[80vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>{{ t("采购表") }}</DialogTitle>
        </DialogHeader>
        <ShoppingList :items="shoppingItems" :title="data.combo.name" />
      </DialogContent>
    </Dialog>
  </div>
</template>
