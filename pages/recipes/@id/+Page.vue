<script setup lang="ts">
import { ChevronLeft, Clock } from "lucide-vue-next";
import { useData } from "vike-vue/useData";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";

import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import ReviewSection from "@/components/ReviewSection.vue";
import ShoppingList from "@/components/ShoppingList.vue";
import SlideshowView from "@/components/SlideshowView.vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        <a
          href="/recipes"
          class="inline-flex items-center gap-1 text-sm text-(--color-on-surface-muted) hover:text-(--color-primary)"
        >
          <ChevronLeft class="h-4 w-4" />
          {{ t("返回") }}
        </a>
        <div class="flex items-center gap-2">
          <button
            class="inline-flex items-center gap-1.5 rounded border border-(--color-border) px-3 py-1.5 text-sm transition-colors"
            :class="
              steps.length > 0
                ? 'hover:bg-(--color-surface-hover)'
                : 'cursor-not-allowed opacity-50'
            "
            @click="startSlideshow"
          >
            {{ t("幻灯片模式") }}
          </button>
          <button
            v-if="ingredients.length > 0"
            class="inline-flex items-center gap-1.5 rounded border border-(--color-border) px-3 py-1.5 text-sm transition-colors hover:bg-(--color-surface-hover)"
            @click="shoppingListOpen = true"
          >
            {{ t("采购表") }}
          </button>
          <a
            :href="`/recipes/${recipe.id}/edit`"
            class="inline-flex items-center gap-1.5 rounded bg-(--color-primary) px-3 py-1.5 text-sm font-semibold text-(--color-on-primary) transition-colors hover:bg-(--color-primary-hover)"
          >
            {{ t("编辑") }}
          </a>
        </div>
      </div>

      <!-- Header -->
      <div class="mb-8">
        <!-- Cover Image -->
        <div v-if="recipe.coverImage" class="mb-6 overflow-hidden rounded">
          <img
            :src="recipe.coverImage"
            :alt="recipe.name"
            class="w-full object-cover"
            style="max-height: 400px"
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
          <span
            v-if="recipe.estimatedTime"
            class="inline-flex items-center gap-1 rounded border border-(--color-border) px-2.5 py-1 text-xs"
          >
            <Clock class="h-3.5 w-3.5" />
            {{ recipe.estimatedTime }} {{ t("分钟") }}
          </span>
          <span
            v-for="tag in tags"
            :key="tag.tagId"
            class="rounded-full bg-(--color-primary-light) px-2.5 py-1 text-xs text-(--color-primary)"
          >
            {{ tag.tagName }}
          </span>
        </div>
      </div>

      <!-- Ingredients -->
      <section v-if="ingredients.length > 0" class="mb-8">
        <h2 class="mb-3 text-xl font-semibold">{{ t("食材列表") }}</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr
                class="border-b border-(--color-border) text-left text-(--color-on-surface-muted)"
              >
                <th class="pb-2 font-medium">{{ t("名称") }}</th>
                <th class="pb-2 font-medium">{{ t("用量") }}</th>
                <th class="pb-2 font-medium">{{ t("备注") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in ingredients"
                :key="item.id"
                class="border-b border-(--color-border)"
              >
                <td class="py-2">
                  {{ item.ingredientName }}
                </td>
                <td class="py-2">
                  {{
                    item.quantity || item.unit
                      ? `${item.quantity ?? ""} ${item.unit ?? ""}`
                      : "—"
                  }}
                </td>
                <td class="py-2 text-(--color-on-surface-muted)">
                  {{ item.note || "—" }}
                </td>
              </tr>
            </tbody>
          </table>
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
        <ScrollArea class="h-[calc(80vh-6rem)]">
          <ShoppingList
            :items="shoppingItems"
            :title="recipe.name + ' — ' + t('采购表')"
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  </div>
</template>
