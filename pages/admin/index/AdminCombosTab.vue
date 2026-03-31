<script setup lang="ts">
import { navigate } from "vike/client/router";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import type { Combo } from "@/database/drizzle/schema/combos";

import AdminDataTable from "@/components/AdminDataTable.vue";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TableCell, TableHead } from "@/components/ui/table";

import { onDeleteCombo } from "./AdminCombosTab.telefunc";

const props = defineProps<{
  combos: Combo[];
}>();

const { t } = useI18n();

const comboList = ref([...props.combos]);

const handleBatchDelete = async (ids: string[]) => {
  await Promise.all(ids.map((id) => onDeleteCombo(id)));
  comboList.value = comboList.value.filter((c) => !ids.includes(c.id));
};

const confirmDialog = ref<{ message: string; onConfirm: () => void } | null>(
  null,
);

const confirmDeleteCombo = (combo: Combo) => {
  confirmDialog.value = {
    message: t("确认删除此搭配？"),
    onConfirm: async () => {
      await onDeleteCombo(combo.id);
      comboList.value = comboList.value.filter((c) => c.id !== combo.id);
    },
  };
};
</script>

<template>
  <AdminDataTable
    :items="comboList"
    search-key="name"
    @batch-delete="handleBatchDelete"
  >
    <template #header>
      <TableHead>{{ t("名称") }}</TableHead>
      <TableHead>{{ t("预计用时") }}</TableHead>
      <TableHead class="text-right">{{ t("操作") }}</TableHead>
    </template>

    <template #row="{ item: combo }">
      <TableCell>
        <a :href="`/combos/${combo.id}`" class="hover:underline">{{
          combo.name
        }}</a>
      </TableCell>
      <TableCell class="text-(--color-on-surface-muted)">
        {{
          combo.estimatedTime
            ? t("约 {time} 分钟", { time: combo.estimatedTime })
            : "-"
        }}
      </TableCell>
      <TableCell class="text-right">
        <Button @click="navigate(`/combos/${combo.id}/edit`)">{{
          t("编辑")
        }}</Button>
        <Button @click="confirmDeleteCombo(combo)">
          {{ t("删除") }}
        </Button>
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
