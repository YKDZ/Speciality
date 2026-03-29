<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import type { Tag } from "@/database/drizzle/schema/tags";

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

import { onCreateTag, onDeleteTag, onUpdateTag } from "./AdminTagsTab.telefunc";

const props = defineProps<{
  tags: Tag[];
}>();

const { t } = useI18n();

const tagList = ref([...props.tags]);

const handleBatchDelete = async (ids: string[]) => {
  await Promise.all(ids.map((id) => onDeleteTag(id)));
  tagList.value = tagList.value.filter((tag) => !ids.includes(tag.id));
};

const dialogOpen = ref(false);
const editingTag = ref<{ id: string; name: string } | null>(null);

const openCreateDialog = () => {
  editingTag.value = { id: "", name: "" };
  dialogOpen.value = true;
};

const openEditDialog = (tag: Tag) => {
  editingTag.value = { id: tag.id, name: tag.name };
  dialogOpen.value = true;
};

const closeDialog = () => {
  dialogOpen.value = false;
  editingTag.value = null;
};

const saveTag = async () => {
  if (!editingTag.value?.name) return;
  const data = editingTag.value;

  if (data.id) {
    const updated = await onUpdateTag(data.id, data.name);
    if (updated) {
      const idx = tagList.value.findIndex((tag) => tag.id === data.id);
      if (idx >= 0) tagList.value[idx] = updated;
    }
  } else {
    const created = await onCreateTag(data.name);
    tagList.value.push(created);
  }
  closeDialog();
};

const confirmDialog = ref<{ message: string; onConfirm: () => void } | null>(
  null,
);

const confirmDeleteTag = (tag: Tag) => {
  confirmDialog.value = {
    message: t("确认删除此标签？"),
    onConfirm: async () => {
      await onDeleteTag(tag.id);
      tagList.value = tagList.value.filter((t) => t.id !== tag.id);
    },
  };
};
</script>

<template>
  <AdminDataTable
    :items="tagList"
    search-key="name"
    @batch-delete="handleBatchDelete"
  >
    <template #actions>
      <Button size="sm" @click="openCreateDialog">+ {{ t("新建标签") }}</Button>
    </template>

    <template #header>
      <TableHead>{{ t("标签名称") }}</TableHead>
      <TableHead class="text-right">{{ t("操作") }}</TableHead>
    </template>

    <template #row="{ item: tag }">
      <TableCell>
        <span
          class="rounded-full bg-(--color-primary-light) px-2.5 py-1 text-xs text-(--color-primary)"
        >
          {{ tag.name }}
        </span>
      </TableCell>
      <TableCell class="text-right">
        <button
          class="mr-3 text-(--color-primary) hover:underline"
          @click="openEditDialog(tag)"
        >
          {{ t("编辑") }}
        </button>
        <button
          class="text-(--color-danger) hover:underline"
          @click="confirmDeleteTag(tag)"
        >
          {{ t("删除") }}
        </button>
      </TableCell>
    </template>

    <template #dialogs>
      <!-- Edit/Create Dialog -->
      <Dialog :open="dialogOpen" @update:open="(v) => !v && closeDialog()">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{
              editingTag?.id ? t("编辑标签") : t("新建标签")
            }}</DialogTitle>
          </DialogHeader>
          <div v-if="editingTag">
            <Label class="mb-1 block text-xs">{{ t("标签名称") }}</Label>
            <Input v-model="editingTag.name" type="text" />
          </div>
          <DialogFooter>
            <Button variant="outline" @click="closeDialog">{{
              t("取消")
            }}</Button>
            <Button @click="saveTag">{{ t("保存") }}</Button>
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
