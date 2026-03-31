<script setup lang="ts">
import { ChevronLeft, Clock, EllipsisVertical } from "lucide-vue-next";
import { useData } from "vike-vue/useData";
import { navigate } from "vike/client/router";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";

import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import ReviewSection from "@/components/ReviewSection.vue";
import ShoppingList from "@/components/ShoppingList.vue";
import SlideshowView from "@/components/SlideshowView.vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Data } from "./+data";

const { t } = useI18n();
const { recipe, steps, images, ingredients, tags, reviews } = useData<Data>();
const slideshowMode = ref(false);
const shoppingListOpen = ref(false);

const startSlideshow = () => {
  if (steps.length === 0) {
    toast(t("该食谱暂无步骤，无法启动幻灯片模式"));
    return;
  }

  slideshowMode.value = true;
};

const handleExport = async () => {
  const res = await fetch(`/api/recipes/${recipe.id}/export`);
  if (!res.ok) {
    toast(t("导出失败"));
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const contentType = res.headers.get("Content-Type") ?? "";
  const ext = contentType.includes("text/markdown") ? ".md" : ".zip";
  a.download = `${recipe.name}${ext}`;
  a.click();
  URL.revokeObjectURL(url);
};

const shoppingItems = computed(() =>
  ingredients.map((ing) => ({
    ingredientId: ing.ingredientId,
    ingredientName: ing.ingredientName,
    quantity: ing.quantity ?? undefined,
    unit: ing.unit ?? undefined,
    note: ing.note ?? undefined,
    recipeName: recipe.name,
  })),
);
</script>

<template>
  <div>
    <!-- Slideshow Mode -->
    <SlideshowView
      v-if="slideshowMode"
      :steps="steps.map((s) => ({ ...s, name: s.name ?? undefined }))"
      :recipe-name="recipe.name"
      @exit="slideshowMode = false"
    />

    <!-- Normal Detail View -->
    <div v-else>
      <!-- Back & Actions -->
      <div class="mb-6 flex items-center justify-between">
        <Button variant="ghost" @click="navigate('/')">
          <ChevronLeft class="h-4 w-4" />
          {{ t("返回") }}
        </Button>
        <div class="flex items-center gap-2">
          <!-- 宽屏：所有按钮平铺（md 及以上显示） -->
          <Button
            class="hidden md:inline-flex"
            variant="outline"
            @click="startSlideshow"
          >
            {{ t("幻灯片模式") }}
          </Button>
          <Button
            v-if="ingredients.length > 0"
            variant="outline"
            class="hidden md:inline-flex"
            @click="shoppingListOpen = true"
          >
            {{ t("采购表") }}
          </Button>
          <Button
            variant="outline"
            class="hidden md:inline-flex"
            @click="handleExport"
          >
            {{ t("导出 Markdown") }}
          </Button>

          <!-- 窄屏：Drawer 收纳次要操作（md 以下显示） -->
          <Drawer>
            <DrawerTrigger as-child>
              <Button variant="outline" class="inline-flex md:hidden">
                <EllipsisVertical class="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{{ t("操作") }}</DrawerTitle>
              </DrawerHeader>
              <div class="flex flex-col gap-2 px-4 pb-6">
                <DrawerClose as-child>
                  <Button
                    variant="secondary"
                    :disabled="steps.length === 0"
                    @click="startSlideshow"
                  >
                    {{ t("幻灯片模式") }}
                  </Button>
                </DrawerClose>
                <DrawerClose v-if="ingredients.length > 0" as-child>
                  <Button variant="secondary" @click="shoppingListOpen = true">
                    {{ t("采购表") }}
                  </Button>
                </DrawerClose>
                <DrawerClose as-child>
                  <Button variant="secondary" @click="handleExport">
                    {{ t("导出 Markdown") }}
                  </Button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>

          <!-- 主操作：始终可见 -->
          <Button
            variant="outline"
            @click="navigate(`/recipe/${recipe.id}/edit`)"
          >
            {{ t("编辑") }}
          </Button>
        </div>
      </div>

      <!-- Header -->
      <div class="mb-8">
        <!-- Cover Image -->
        <div
          v-if="recipe.coverImage"
          class="relative mb-6 aspect-video max-h-100 overflow-hidden rounded bg-muted"
        >
          <img
            :src="recipe.coverImage"
            :alt="recipe.name"
            class="absolute inset-0 h-full w-full object-cover"
            style="object-fit: cover"
          />
        </div>

        <!-- Image gallery -->
        <div v-if="images.length > 0" class="mb-6 flex gap-2 overflow-x-auto">
          <img
            v-for="img in images"
            :key="img.id"
            :src="img.url"
            class="h-24 w-24 shrink-0 rounded border border-(--color-border) object-cover"
            loading="lazy"
          />
        </div>

        <h1 class="text-3xl font-bold tracking-tight">{{ recipe.name }}</h1>
        <MarkdownRenderer
          v-if="recipe.description"
          :content="recipe.description"
          class="mt-2 text-(--color-on-surface-muted)"
        />

        <!-- Meta row -->
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <Badge variant="outline" v-if="recipe.estimatedTime">
            <Clock />
            {{ t("{time} 分钟", { time: recipe.estimatedTime }) }}
          </Badge>
          <Badge variant="secondary" v-for="tag in tags" :key="tag.tagId">
            {{ tag.tagName }}
          </Badge>
        </div>
      </div>

      <!-- Ingredients -->
      <section v-if="ingredients.length > 0" class="mb-8">
        <h2 class="mb-3 text-xl font-semibold">{{ t("食材列表") }}</h2>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{{ t("名称") }}</TableHead>
                <TableHead>{{ t("用量") }}</TableHead>
                <TableHead>{{ t("备注") }}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in ingredients" :key="item.id">
                <TableCell>
                  {{ item.ingredientName }}
                </TableCell>
                <TableCell>
                  {{
                    item.quantity || item.unit
                      ? `${item.quantity ?? ""} ${item.unit ?? ""}`
                      : "-"
                  }}
                </TableCell>
                <TableCell class="text-(--color-on-surface-muted)">
                  {{ item.note || "-" }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      <!-- Steps -->
      <section v-if="steps.length > 0" class="mb-8">
        <h2 class="mb-3 text-xl font-semibold">{{ t("步骤") }}</h2>
        <ol class="space-y-4">
          <li
            v-for="(step, idx) in steps"
            :key="step.id"
            class="rounded border border-(--color-border) p-4"
          >
            <div class="mb-2 text-xs font-semibold text-(--color-primary)">
              {{
                t("步骤 {current}/{total}", {
                  current: idx + 1,
                  total: steps.length,
                })
              }}
            </div>
            <MarkdownRenderer
              :content="step.content"
              class="prose-sm leading-relaxed"
            />
          </li>
        </ol>
      </section>

      <!-- Reviews -->
      <ReviewSection :recipe-id="recipe.id" :initial-reviews="reviews" />
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
        <ShoppingList
          :items="shoppingItems"
          :title="t('{name} 的采购表', { name: recipe.name })"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>
