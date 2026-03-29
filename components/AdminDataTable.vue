<script
  setup
  lang="ts"
  generic="T extends { id: string; [key: string]: unknown }"
>
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const props = withDefaults(
  defineProps<{
    items: T[];
    searchKey: string;
    pageSize?: number;
  }>(),
  { pageSize: 10 },
);

const emit = defineEmits<{
  batchDelete: [ids: string[]];
}>();

const { t } = useI18n();

const searchQuery = ref("");
const currentPage = ref(1);
const selectedIds = ref<string[]>([]);
const batchDeleteOpen = ref(false);

const effectivePageSize = computed(() => props.pageSize ?? 10);

const filteredList = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.items;
  return props.items.filter((item) => {
    const val = item[props.searchKey];
    return typeof val === "string" && val.toLowerCase().includes(q);
  });
});

// Reset page when filter changes
watch(filteredList, () => {
  if (currentPage.value > totalPages.value)
    currentPage.value = totalPages.value;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredList.value.length / effectivePageSize.value)),
);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * effectivePageSize.value;
  return filteredList.value.slice(start, start + effectivePageSize.value);
});

const allSelected = computed(
  () =>
    paginatedItems.value.length > 0 &&
    paginatedItems.value.every((item) => selectedIds.value.includes(item.id)),
);

const toggleAll = () => {
  if (allSelected.value) {
    selectedIds.value = selectedIds.value.filter(
      (id) => !paginatedItems.value.some((item) => item.id === id),
    );
  } else {
    const toAdd = paginatedItems.value
      .map((item) => item.id)
      .filter((id) => !selectedIds.value.includes(id));
    selectedIds.value = [...selectedIds.value, ...toAdd];
  }
};

const toggleOne = (id: string) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((v) => v !== id);
  } else {
    selectedIds.value = [...selectedIds.value, id];
  }
};

const handleBatchDelete = () => {
  emit("batchDelete", [...selectedIds.value]);
  selectedIds.value = [];
  batchDeleteOpen.value = false;
};
</script>

<template>
  <div>
    <!-- 搜索栏 + 批量操作 + 自定义操作 -->
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <Input
        v-model="searchQuery"
        :placeholder="t('搜索...')"
        class="max-w-xs"
        @input="currentPage = 1"
      />
      <p class="text-sm text-(--color-on-surface-muted)">
        {{ t("共 {count} 项", { count: props.items.length }) }}
      </p>
      <AlertDialog
        :open="batchDeleteOpen"
        @update:open="(v) => (batchDeleteOpen = v)"
      >
        <AlertDialogTrigger as-child>
          <Button
            v-if="selectedIds.length > 0"
            variant="destructive"
            size="sm"
            @click="batchDeleteOpen = true"
          >
            {{ t("删除选中 ({count})", { count: selectedIds.length }) }}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{{ t("确认删除") }}</AlertDialogTitle>
            <AlertDialogDescription>
              {{
                t("确认删除选中的 {count} 项？", {
                  count: selectedIds.length,
                })
              }}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel @click="batchDeleteOpen = false">
              {{ t("取消") }}
            </AlertDialogCancel>
            <AlertDialogAction @click="handleBatchDelete">
              {{ t("确认") }}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div class="ml-auto flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-if="filteredList.length === 0"
      class="py-12 text-center text-(--color-on-surface-muted)"
    >
      {{ t("暂无数据") }}
    </div>
    <div v-else class="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-10">
              <Checkbox
                :model-value="allSelected"
                @update:model-value="toggleAll"
              />
            </TableHead>
            <slot name="header" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in paginatedItems" :key="item.id">
            <TableCell class="w-10">
              <Checkbox
                :model-value="selectedIds.includes(item.id)"
                @update:model-value="toggleOne(item.id)"
              />
            </TableCell>
            <slot
              name="row"
              :item="item"
              :selected="selectedIds.includes(item.id)"
              :toggle="() => toggleOne(item.id)"
            />
          </TableRow>
        </TableBody>
      </Table>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="mt-4">
        <Pagination
          :total="filteredList.length"
          :items-per-page="effectivePageSize"
          :page="currentPage"
          @update:page="currentPage = $event"
        >
          <PaginationContent v-slot="{ items: pageItems }">
            <PaginationPrevious>
              <ChevronLeft class="size-4" />
              <span class="hidden sm:block">{{ t("上一页") }}</span>
            </PaginationPrevious>
            <template v-for="(pageItem, idx) in pageItems" :key="idx">
              <PaginationItem
                v-if="pageItem.type === 'page'"
                :value="pageItem.value"
                :is-active="pageItem.value === currentPage"
              >
                {{ pageItem.value }}
              </PaginationItem>
              <PaginationEllipsis v-else />
            </template>
            <PaginationNext>
              <span class="hidden sm:block">{{ t("下一页") }}</span>
              <ChevronRight class="size-4" />
            </PaginationNext>
          </PaginationContent>
        </Pagination>
      </div>
    </div>

    <!-- 额外对话框插槽 -->
    <slot name="dialogs" />
  </div>
</template>
