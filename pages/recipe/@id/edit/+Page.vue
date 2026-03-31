<script setup lang="ts">
import { useData } from "vike-vue/useData";
import { navigate } from "vike/client/router";
import { useI18n } from "vue-i18n";

import RecipeForm from "@/components/RecipeForm.vue";
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import type { Data } from "./+data";

import {
  onDeleteRecipe,
  onUpdateRecipe,
  onUpsertRecipeIngredients,
  onUpsertRecipeTags,
  onUpsertSteps,
} from "./+Page.telefunc";

const { t } = useI18n();
const { recipe, steps, ingredients, recipeTags, allIngredients, allTags } =
  useData<Data>();

const handleDelete = async () => {
  await onDeleteRecipe(recipe.id);
  await navigate("/");
};

const onSave = async (formData: {
  name: string;
  description: string;
  estimatedTime?: number;
  coverImage: string;
  steps: { content: string; sortOrder: number; name?: string }[];
  tagIds: string[];
  ingredients: { ingredientId: string; amount?: string; note?: string }[];
}) => {
  await onUpdateRecipe(recipe.id, {
    name: formData.name,
    description: formData.description || undefined,
    estimatedTime: formData.estimatedTime || undefined,
    coverImage: formData.coverImage || undefined,
  });

  await onUpsertSteps(recipe.id, formData.steps);
  await onUpsertRecipeTags(recipe.id, formData.tagIds);
  await onUpsertRecipeIngredients(recipe.id, formData.ingredients);

  await navigate(`/recipe/${recipe.id}`);
};
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">{{ t("编辑食谱") }}</h1>
      <div class="flex items-center gap-2">
        <Button variant="outline" @click="navigate(`/recipe/${recipe.id}`)">
          {{ t("取消") }}
        </Button>
        <template v-if="true">
          <!-- 宽屏：AlertDialog（md 及以上显示） -->
          <div class="hidden md:block">
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button variant="destructive" size="sm">{{
                  t("删除食谱")
                }}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{{
                    t("确认删除此食谱？")
                  }}</AlertDialogTitle>
                  <AlertDialogDescription>{{
                    recipe.name
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
          <!-- 窄屏：Drawer（md 以下显示） -->
          <div class="md:hidden">
            <Drawer>
              <DrawerTrigger as-child>
                <Button variant="destructive" size="sm">{{
                  t("删除食谱")
                }}</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>{{ t("确认删除此食谱？") }}</DrawerTitle>
                  <DrawerDescription>{{ recipe.name }}</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button variant="destructive" @click="handleDelete">{{
                    t("删除")
                  }}</Button>
                  <DrawerClose as-child>
                    <Button variant="outline">{{ t("取消") }}</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </template>
      </div>
    </div>

    <RecipeForm
      :initial-data="{
        name: recipe.name,
        description: recipe.description ?? '',
        estimatedTime: recipe.estimatedTime ?? undefined,
        coverImage: recipe.coverImage ?? '',
        steps: steps.map((s) => ({
          content: s.content,
          sortOrder: s.sortOrder,
          name: s.name ?? '',
        })),
        tagIds: recipeTags.map((t) => t.tagId),
        ingredients: ingredients.map((i) => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity ?? undefined,
          unit: i.unit ?? undefined,
          note: i.note ?? '',
        })),
      }"
      :all-ingredients="allIngredients"
      :all-tags="allTags"
      @save="onSave"
    />
  </div>
</template>
