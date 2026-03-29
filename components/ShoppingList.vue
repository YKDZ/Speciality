<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  buildMergedItems,
  copyToClipboard,
  exportGroupedAsText,
  exportMergedAsText,
  groupShoppingItems,
} from "@/lib/export";

export interface ShoppingItem {
  ingredientId: string;
  ingredientName: string;
  quantity?: string;
  unit?: string;
  note?: string;
  recipeName: string;
}

const props = withDefaults(
  defineProps<{
    items: ShoppingItem[];
    title?: string;
  }>(),
  { title: undefined },
);

const { t } = useI18n();
const showMerged = ref(true);

const isSingleRecipe = computed(() => {
  if (props.items.length === 0) return true;
  const first = props.items[0]!.recipeName;
  return props.items.every((item) => item.recipeName === first);
});

const amountDisplay = (a: { quantity?: string; unit?: string }) =>
  a.quantity || a.unit ? `${a.quantity ?? ""} ${a.unit ?? ""}` : "—";

const groupedItems = computed(() => groupShoppingItems(props.items));
const mergedItems = computed(() => buildMergedItems(groupedItems.value));

const handleCopyText = () => {
  const titleStr = props.title || t("采购表");
  const text = showMerged.value
    ? exportMergedAsText(mergedItems.value, titleStr, isSingleRecipe.value)
    : exportGroupedAsText(groupedItems.value, titleStr, isSingleRecipe.value);
  copyToClipboard(text);
  toast(t("已复制到剪贴板"));
};
</script>

<template>
  <div class="p-4">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-semibold">
        {{ title || t("采购表") }}
      </h3>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :class="showMerged ? 'bg-accent' : ''"
          @click="showMerged = !showMerged"
          v-if="!isSingleRecipe"
        >
          <span v-if="showMerged"> {{ t("分离") }}</span>
          <span v-else> {{ t("求和") }}</span>
        </Button>
        <Button variant="outline" size="sm" @click="handleCopyText">
          {{ t("复制") }}
        </Button>
      </div>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{{ t("名称") }}</TableHead>
          <TableHead>{{ t("用量") }}</TableHead>
          <TableHead>{{ t("备注") }}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <!-- 合并视图：数值同单位求和 -->
        <template v-if="showMerged">
          <TableRow
            v-for="item in mergedItems"
            :key="`${item.ingredientId}::${item.note ?? ''}`"
          >
            <TableCell>{{ item.ingredientName }}</TableCell>
            <TableCell>
              <div class="space-y-0.5">
                <div v-for="(line, i) in item.lines" :key="i" class="text-sm">
                  {{ line.display }}
                  <span
                    v-if="!isSingleRecipe"
                    class="text-xs text-(--color-on-surface-muted)"
                  >
                    （{{ line.recipeNames.join(", ") }}）
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell class="text-sm text-(--color-on-surface-muted)">
              {{ item.note || "—" }}
            </TableCell>
          </TableRow>
        </template>
        <!-- 分离视图：同食材合并行，用量分开显示 -->
        <template v-else>
          <TableRow
            v-for="item in groupedItems"
            :key="`${item.ingredientId}::${item.note ?? ''}`"
          >
            <TableCell>{{ item.ingredientName }}</TableCell>
            <TableCell>
              <div class="space-y-0.5">
                <div v-for="(a, i) in item.amounts" :key="i" class="text-sm">
                  {{ amountDisplay(a) }}
                  <span
                    v-if="!isSingleRecipe"
                    class="text-xs text-(--color-on-surface-muted)"
                  >
                    （{{ a.recipeName }}）
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell class="text-sm text-(--color-on-surface-muted)">
              {{ item.note || "—" }}
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
