<script setup lang="ts">
import { navigate } from "vike/client/router";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import type { Recipe } from "@/database/drizzle/schema/recipes";

import AdminDataTable from "@/components/AdminDataTable.vue";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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

const handleExport = async (ids: string[]) => {
  let res: Response;
  if (ids.length === 1) {
    res = await fetch(`/api/recipes/${ids[0]}/export`);
  } else {
    res = await fetch("/api/recipes/export-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
  }
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const contentType = res.headers.get("Content-Type") ?? "";
  if (ids.length === 1) {
    const ext = contentType.includes("text/markdown") ? ".md" : ".zip";
    a.download = `${recipeList.value.find((r) => r.id === ids[0])?.name ?? "recipe"}${ext}`;
  } else {
    a.download = "recipes-export.zip";
  }
  a.click();
  URL.revokeObjectURL(url);
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

    <template #actions="{ selectedIds }">
      <Button
        v-if="selectedIds.length > 0"
        variant="outline"
        size="sm"
        @click="handleExport(selectedIds)"
      >
        {{ t("导出选中 ({count})", { count: selectedIds.length }) }}
      </Button>
    </template>

    <template #row="{ item: recipe }">
      <TableCell>
        <Button as="a" :href="`/recipe/${recipe.id}`" variant="link">{{
          recipe.name
        }}</Button>
      </TableCell>
      <TableCell class="text-(--color-on-surface-muted)">
        {{
          recipe.estimatedTime
            ? t("{time} 分钟", { time: recipe.estimatedTime })
            : "-"
        }}
      </TableCell>
      <TableCell class="text-right">
        <div class="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            @click="navigate(`/recipe/${recipe.id}/edit`)"
            >{{ t("编辑") }}</Button
          >
          <Button
            size="sm"
            variant="destructive"
            @click="confirmDeleteRecipe(recipe)"
          >
            {{ t("删除") }}
          </Button>
        </div>
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
            <Button
              @click="
                confirmDialog?.onConfirm();
                confirmDialog = null;
              "
            >
              {{ t("确认") }}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </template>
  </AdminDataTable>
</template>
