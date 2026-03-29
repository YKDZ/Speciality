<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import type { Recipe } from "@/database/drizzle/schema/recipes";

import AdminDataTable from "@/components/AdminDataTable.vue";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TableCell, TableHead } from "@/components/ui/table";

import { onDeleteRecipe } from "./AdminRecipesTab.telefunc";

const props = defineProps<{
  recipes: Recipe[];
}>();

const { t } = useI18n();

const recipeList = ref([...props.recipes]);

const handleBatchDelete = async (ids: string[]) => {
  await Promise.all(ids.map((id) => onDeleteRecipe(id)));
  recipeList.value = recipeList.value.filter((r) => !ids.includes(r.id));
};

const confirmDialog = ref<{ message: string; onConfirm: () => void } | null>(
  null,
);

const confirmDeleteRecipe = (recipe: Recipe) => {
  confirmDialog.value = {
    message: t("确认删除此食谱？"),
    onConfirm: async () => {
      await onDeleteRecipe(recipe.id);
      recipeList.value = recipeList.value.filter((r) => r.id !== recipe.id);
    },
  };
};
</script>

<template>
  <AdminDataTable
    :items="recipeList"
    search-key="name"
    @batch-delete="handleBatchDelete"
  >
    <template #header>
      <TableHead>{{ t("名称") }}</TableHead>
      <TableHead>{{ t("预计用时") }}</TableHead>
      <TableHead class="text-right">{{ t("操作") }}</TableHead>
    </template>

    <template #row="{ item: recipe }">
      <TableCell>
        <a :href="`/recipes/${recipe.id}`" class="hover:underline">{{
          recipe.name
        }}</a>
      </TableCell>
      <TableCell class="text-(--color-on-surface-muted)">
        {{
          recipe.estimatedTime ? `${recipe.estimatedTime} ${t("分钟")}` : "—"
        }}
      </TableCell>
      <TableCell class="text-right">
        <a
          :href="`/recipes/${recipe.id}/edit`"
          class="mr-3 text-(--color-primary) hover:underline"
          >{{ t("编辑") }}</a
        >
        <button
          class="text-(--color-danger) hover:underline"
          @click="confirmDeleteRecipe(recipe)"
        >
          {{ t("删除") }}
        </button>
      </TableCell>
    </template>

    <template #dialogs>
      <!-- Confirm Delete Dialog -->
      <AlertDialog
        :open="!!confirmDialog"
        @update:open="(v) => !v && (confirmDialog = null)"
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{{ t("确认删除") }}</AlertDialogTitle>
            <AlertDialogDescription>{{
              confirmDialog?.message
            }}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel @click="confirmDialog = null">{{
              t("取消")
            }}</AlertDialogCancel>
            <AlertDialogAction
              @click="
                confirmDialog?.onConfirm();
                confirmDialog = null;
              "
            >
              {{ t("确认") }}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </template>
  </AdminDataTable>
</template>
