<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import type { Ingredient } from "@/database/drizzle/schema/ingredients";

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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableHead } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import {
  onCreateIngredient,
  onDeleteIngredient,
  onUpdateIngredient,
} from "./AdminIngredientsTab.telefunc";

const props = defineProps<{
  ingredients: Ingredient[];
}>();

const { t } = useI18n();

const ingredientList = ref([...props.ingredients]);

const handleBatchDelete = async (ids: string[]) => {
  await Promise.all(ids.map((id) => onDeleteIngredient(id)));
  ingredientList.value = ingredientList.value.filter(
    (i) => !ids.includes(i.id),
  );
};

type EditForm = {
  id: string;
  name: string;
  description: string;
};

const dialogOpen = ref(false);
const editingIngredient = ref<EditForm | null>(null);

const openCreateDialog = () => {
  editingIngredient.value = { id: "", name: "", description: "" };
  dialogOpen.value = true;
};

const openEditDialog = (ing: Ingredient) => {
  editingIngredient.value = {
    id: ing.id,
    name: ing.name,
    description: ing.description ?? "",
  };
  dialogOpen.value = true;
};

const closeDialog = () => {
  dialogOpen.value = false;
  editingIngredient.value = null;
};

const saveIngredient = async () => {
  if (!editingIngredient.value?.name) return;
  const data = editingIngredient.value;

  if (data.id) {
    const updated = await onUpdateIngredient(data.id, {
      name: data.name,
      description: data.description || undefined,
    });
    if (updated) {
      const idx = ingredientList.value.findIndex((i) => i.id === data.id);
      if (idx >= 0) ingredientList.value[idx] = updated;
    }
  } else {
    const created = await onCreateIngredient({
      name: data.name,
      description: data.description || undefined,
    });
    ingredientList.value.push(created);
  }
  closeDialog();
};

const confirmDialog = ref<{ message: string; onConfirm: () => void } | null>(
  null,
);

const confirmDeleteIngredient = (ing: Ingredient) => {
  confirmDialog.value = {
    message: t("确认删除此食材？"),
    onConfirm: async () => {
      await onDeleteIngredient(ing.id);
      ingredientList.value = ingredientList.value.filter(
        (i) => i.id !== ing.id,
      );
    },
  };
};
</script>

<template>
  <AdminDataTable
    :items="ingredientList"
    search-key="name"
    @batch-delete="handleBatchDelete"
  >
    <template #actions>
      <Button size="sm" @click="openCreateDialog">+ {{ t("新建食材") }}</Button>
    </template>

    <template #header>
      <TableHead>{{ t("名称") }}</TableHead>
      <TableHead>{{ t("描述") }}</TableHead>
      <TableHead class="text-right">{{ t("操作") }}</TableHead>
    </template>

    <template #row="{ item: ing }">
      <TableCell>
        <div class="flex items-center gap-2">
          {{ ing.name }}
        </div>
      </TableCell>
      <TableCell class="text-(--color-on-surface-muted)">
        {{ ing.description || "-" }}
      </TableCell>
      <TableCell class="text-right">
        <div class="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" @click="openEditDialog(ing)">{{
            t("编辑")
          }}</Button>
          <Button
            size="sm"
            variant="destructive"
            @click="confirmDeleteIngredient(ing)"
          >
            {{ t("删除") }}
          </Button>
        </div>
      </TableCell>
    </template>

    <template #dialogs>
      <!-- Edit/Create Dialog -->
      <Dialog :open="dialogOpen" @update:open="(v) => !v && closeDialog()">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{
              editingIngredient?.id ? t("编辑食材") : t("新建食材")
            }}</DialogTitle>
          </DialogHeader>
          <div v-if="editingIngredient" class="space-y-3">
            <div>
              <Label class="mb-1 block text-xs">{{ t("名称") }}</Label>
              <Input v-model="editingIngredient.name" type="text" />
            </div>
            <div>
              <Label class="mb-1 block text-xs">{{ t("描述") }}</Label>
              <Textarea
                v-model="editingIngredient.description"
                :rows="2"
                class="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" @click="closeDialog">{{
              t("取消")
            }}</Button>
            <Button @click="saveIngredient">{{ t("保存") }}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
