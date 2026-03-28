<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <!-- Name -->
    <div>
      <label class="mb-1 block text-sm font-medium">{{ t("食谱名称") }}</label>
      <input
        v-model="form.name"
        type="text"
        required
        class="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
      />
    </div>

    <!-- Description (markdown) -->
    <div>
      <label class="mb-1 block text-sm font-medium">{{ t("简介") }}</label>
      <MarkdownEditor v-model="form.description" />
    </div>

    <!-- Time & Media -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label class="mb-1 block text-sm font-medium"
          >{{ t("预计用时") }}（{{ t("分钟") }}）</label
        >
        <input
          v-model.number="form.estimatedTime"
          type="number"
          min="1"
          class="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium"
          >{{ t("封面图片") }} URL</label
        >
        <input
          v-model="form.coverImage"
          type="url"
          class="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium"
          >{{ t("视频") }} URL</label
        >
        <input
          v-model="form.video"
          type="url"
          class="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        />
      </div>
    </div>

    <!-- Tags -->
    <div>
      <label class="mb-2 block text-sm font-medium">{{ t("标签列表") }}</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in allTags"
          :key="tag.id"
          type="button"
          class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
          :class="
            form.tagIds.includes(tag.id)
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
              : 'border-[var(--color-border)] text-[var(--color-on-surface-muted)] hover:border-[var(--color-primary)]'
          "
          @click="toggleTag(tag.id)"
        >
          {{ tag.name }}
        </button>
      </div>
      <p
        v-if="allTags.length === 0"
        class="text-xs text-[var(--color-on-surface-muted)]"
      >
        {{ t("暂无标签") }}
      </p>
    </div>

    <!-- Ingredients -->
    <div>
      <label class="mb-2 block text-sm font-medium">{{ t("食材列表") }}</label>
      <div class="space-y-2">
        <div
          v-for="(item, idx) in form.ingredients"
          :key="idx"
          class="flex items-center gap-2"
        >
          <select
            v-model="item.ingredientId"
            class="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">-- {{ t("食材") }} --</option>
            <option v-for="ing in allIngredients" :key="ing.id" :value="ing.id">
              {{ ing.name }}
            </option>
          </select>
          <input
            v-model="item.amount"
            type="text"
            :placeholder="t('用量')"
            class="w-24 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          <input
            v-model="item.note"
            type="text"
            :placeholder="t('备注')"
            class="w-32 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          <button
            type="button"
            class="shrink-0 rounded p-1 text-[var(--color-danger)] transition-colors hover:bg-red-50"
            @click="form.ingredients.splice(idx, 1)"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      <button
        type="button"
        class="mt-2 text-sm text-[var(--color-primary)] hover:underline"
        @click="
          form.ingredients.push({ ingredientId: '', amount: '', note: '' })
        "
      >
        + {{ t("添加食材") }}
      </button>
    </div>

    <!-- Steps (markdown per step) -->
    <div>
      <label class="mb-2 block text-sm font-medium">{{ t("步骤") }}</label>
      <div class="space-y-4">
        <div
          v-for="(step, idx) in form.steps"
          :key="idx"
          class="rounded border border-[var(--color-border)] p-4"
        >
          <div class="mb-2 flex items-center justify-between">
            <span class="text-xs font-semibold text-[var(--color-primary)]">
              {{
                t("步骤 {current}/{total}", {
                  current: idx + 1,
                  total: form.steps.length,
                })
              }}
            </span>
            <button
              type="button"
              class="rounded p-1 text-[var(--color-danger)] transition-colors hover:bg-red-50"
              @click="
                form.steps.splice(idx, 1);
                reorderSteps();
              "
            >
              <svg
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <MarkdownEditor v-model="step.content" />
        </div>
      </div>
      <button
        type="button"
        class="mt-2 text-sm text-[var(--color-primary)] hover:underline"
        @click="form.steps.push({ content: '', sortOrder: form.steps.length })"
      >
        + {{ t("添加步骤") }}
      </button>
    </div>

    <!-- Submit -->
    <div class="flex gap-3 border-t border-[var(--color-border)] pt-6">
      <button
        type="submit"
        class="rounded bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)]"
      >
        {{ t("保存") }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useI18n } from "vue-i18n";

import type { Ingredient } from "@/database/drizzle/schema/ingredients";
import type { Tag } from "@/database/drizzle/schema/tags";

import MarkdownEditor from "./MarkdownEditor.vue";

const { t } = useI18n();

interface FormData {
  name: string;
  description: string;
  estimatedTime?: number;
  coverImage: string;
  video: string;
  steps: { content: string; sortOrder: number }[];
  tagIds: string[];
  ingredients: { ingredientId: string; amount?: string; note?: string }[];
}

const props = defineProps<{
  initialData?: FormData;
  allIngredients: Ingredient[];
  allTags: Tag[];
}>();

const emit = defineEmits<{
  save: [data: FormData];
}>();

const form = reactive<FormData>(
  props.initialData
    ? {
        ...props.initialData,
        steps: [...props.initialData.steps],
        tagIds: [...props.initialData.tagIds],
        ingredients: [...props.initialData.ingredients],
      }
    : {
        name: "",
        description: "",
        estimatedTime: undefined,
        coverImage: "",
        video: "",
        steps: [],
        tagIds: [],
        ingredients: [],
      },
);

const toggleTag = (tagId: string) => {
  const idx = form.tagIds.indexOf(tagId);
  if (idx >= 0) form.tagIds.splice(idx, 1);
  else form.tagIds.push(tagId);
};

const reorderSteps = () => {
  form.steps.forEach((step, idx) => {
    step.sortOrder = idx;
  });
};

const onSubmit = () => {
  reorderSteps();
  // Filter empty ingredients
  const validIngredients = form.ingredients.filter((i) => i.ingredientId);
  emit("save", { ...form, ingredients: validIngredients });
};
</script>
