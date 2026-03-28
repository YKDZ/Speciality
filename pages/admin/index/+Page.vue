<template>
  <div>
    <h1 class="mb-6 text-3xl font-bold tracking-tight">{{ t("控制面板") }}</h1>

    <!-- Tab navigation -->
    <div class="mb-6 flex gap-1 border-b border-[var(--color-border)]">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="px-4 py-2 text-sm font-medium transition-colors"
        :class="
          activeTab === tab.id
            ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
            : 'text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]'
        "
        @click="activeTab = tab.id"
      >
        {{ t(tab.label) }}
      </button>
    </div>

    <!-- Recipes Tab -->
    <div v-if="activeTab === 'recipes'">
      <p class="mb-4 text-sm text-[var(--color-on-surface-muted)]">
        {{ t("共 {count} 个食谱", { count: recipeList.length }) }}
      </p>
      <div
        v-if="recipeList.length === 0"
        class="py-12 text-center text-[var(--color-on-surface-muted)]"
      >
        {{ t("暂无食谱") }}
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr
              class="border-b border-[var(--color-border)] text-left text-[var(--color-on-surface-muted)]"
            >
              <th class="pb-2 font-medium">{{ t("名称") }}</th>
              <th class="pb-2 font-medium">{{ t("预计用时") }}</th>
              <th class="pb-2 text-right font-medium">{{ t("操作") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="recipe in recipeList"
              :key="recipe.id"
              class="border-b border-[var(--color-border)]"
            >
              <td class="py-2">
                <a :href="`/recipes/${recipe.id}`" class="hover:underline">{{
                  recipe.name
                }}</a>
              </td>
              <td class="py-2 text-[var(--color-on-surface-muted)]">
                {{
                  recipe.estimatedTime
                    ? `${recipe.estimatedTime} ${t("分钟")}`
                    : "—"
                }}
              </td>
              <td class="py-2 text-right">
                <a
                  :href="`/recipes/${recipe.id}/edit`"
                  class="mr-2 text-[var(--color-primary)] hover:underline"
                  >{{ t("编辑") }}</a
                >
                <button
                  class="text-[var(--color-danger)] hover:underline"
                  @click="confirmDeleteRecipe(recipe)"
                >
                  {{ t("删除") }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Ingredients Tab -->
    <div v-if="activeTab === 'ingredients'">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-sm text-[var(--color-on-surface-muted)]">
          {{ t("共 {count} 个食材", { count: ingredientList.length }) }}
        </p>
        <button
          class="inline-flex items-center gap-1.5 rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)]"
          @click="
            editingIngredient = {
              id: '',
              name: '',
              description: '',
              image: '',
              video: '',
              price: '',
            }
          "
        >
          + {{ t("新建食材") }}
        </button>
      </div>

      <!-- Ingredient form modal -->
      <div
        v-if="editingIngredient"
        class="mb-6 rounded border border-[var(--color-border)] p-4"
      >
        <h3 class="mb-3 text-sm font-semibold">
          {{ editingIngredient.id ? t("编辑食材") : t("新建食材") }}
        </h3>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-medium">{{
              t("名称")
            }}</label>
            <input
              v-model="editingIngredient.name"
              type="text"
              class="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium">{{
              t("价格")
            }}</label>
            <input
              v-model="editingIngredient.price"
              type="text"
              class="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-medium">{{
              t("描述")
            }}</label>
            <textarea
              v-model="editingIngredient.description"
              rows="2"
              class="w-full resize-none rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium"
              >{{ t("图片") }} URL</label
            >
            <input
              v-model="editingIngredient.image"
              type="url"
              class="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium"
              >{{ t("视频") }} URL</label
            >
            <input
              v-model="editingIngredient.video"
              type="url"
              class="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
        <div class="mt-3 flex gap-2">
          <button
            class="rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)]"
            @click="saveIngredient"
          >
            {{ t("保存") }}
          </button>
          <button
            class="rounded border border-[var(--color-border)] px-4 py-2 text-sm transition-colors hover:bg-[var(--color-surface-hover)]"
            @click="editingIngredient = null"
          >
            {{ t("取消") }}
          </button>
        </div>
      </div>

      <div
        v-if="ingredientList.length === 0"
        class="py-12 text-center text-[var(--color-on-surface-muted)]"
      >
        {{ t("暂无食材") }}
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr
              class="border-b border-[var(--color-border)] text-left text-[var(--color-on-surface-muted)]"
            >
              <th class="pb-2 font-medium">{{ t("名称") }}</th>
              <th class="pb-2 font-medium">{{ t("描述") }}</th>
              <th class="pb-2 font-medium">{{ t("价格") }}</th>
              <th class="pb-2 text-right font-medium">{{ t("操作") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ing in ingredientList"
              :key="ing.id"
              class="border-b border-[var(--color-border)]"
            >
              <td class="py-2">
                <div class="flex items-center gap-2">
                  <img
                    v-if="ing.image"
                    :src="ing.image"
                    class="h-6 w-6 rounded-full object-cover"
                  />
                  {{ ing.name }}
                </div>
              </td>
              <td class="py-2 text-[var(--color-on-surface-muted)]">
                {{ ing.description || "—" }}
              </td>
              <td class="py-2">{{ ing.price || "—" }}</td>
              <td class="py-2 text-right">
                <button
                  class="mr-2 text-[var(--color-primary)] hover:underline"
                  @click="
                    editingIngredient = {
                      ...ing,
                      description: ing.description ?? '',
                      image: ing.image ?? '',
                      video: ing.video ?? '',
                      price: ing.price ?? '',
                    }
                  "
                >
                  {{ t("编辑") }}
                </button>
                <button
                  class="text-[var(--color-danger)] hover:underline"
                  @click="confirmDeleteIngredient(ing)"
                >
                  {{ t("删除") }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tags Tab -->
    <div v-if="activeTab === 'tags'">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-sm text-[var(--color-on-surface-muted)]">
          {{ t("共 {count} 个标签", { count: tagList.length }) }}
        </p>
        <button
          class="inline-flex items-center gap-1.5 rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)]"
          @click="editingTag = { id: '', name: '' }"
        >
          + {{ t("新建标签") }}
        </button>
      </div>

      <!-- Tag form -->
      <div
        v-if="editingTag"
        class="mb-6 rounded border border-[var(--color-border)] p-4"
      >
        <h3 class="mb-3 text-sm font-semibold">
          {{ editingTag.id ? t("编辑标签") : t("新建标签") }}
        </h3>
        <div class="flex items-end gap-3">
          <div class="flex-1">
            <label class="mb-1 block text-xs font-medium">{{
              t("标签名称")
            }}</label>
            <input
              v-model="editingTag.name"
              type="text"
              class="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <button
            class="rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)]"
            @click="saveTag"
          >
            {{ t("保存") }}
          </button>
          <button
            class="rounded border border-[var(--color-border)] px-4 py-2 text-sm transition-colors hover:bg-[var(--color-surface-hover)]"
            @click="editingTag = null"
          >
            {{ t("取消") }}
          </button>
        </div>
      </div>

      <div
        v-if="tagList.length === 0"
        class="py-12 text-center text-[var(--color-on-surface-muted)]"
      >
        {{ t("暂无标签") }}
      </div>
      <div v-else class="flex flex-wrap gap-2">
        <div
          v-for="tag in tagList"
          :key="tag.id"
          class="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5"
        >
          <span class="text-sm">{{ tag.name }}</span>
          <button
            class="text-xs text-[var(--color-primary)] hover:underline"
            @click="editingTag = { ...tag }"
          >
            {{ t("编辑") }}
          </button>
          <button
            class="text-xs text-[var(--color-danger)] hover:underline"
            @click="confirmDeleteTag(tag)"
          >
            {{ t("删除") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-if="confirmDialog"
      :message="confirmDialog.message"
      @confirm="
        confirmDialog.onConfirm();
        confirmDialog = null;
      "
      @cancel="confirmDialog = null"
    />
  </div>
</template>

<script setup lang="ts">
import { useData } from "vike-vue/useData";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import ConfirmDialog from "@/components/ConfirmDialog.vue";

import type { Data } from "./+data";

const { t } = useI18n();
const { recipes, ingredients, tags } = useData<Data>();

type Tab = "recipes" | "ingredients" | "tags";
const activeTab = ref<Tab>("recipes");

const tabs: { id: Tab; label: string }[] = [
  { id: "recipes", label: "食谱" },
  { id: "ingredients", label: "食材" },
  { id: "tags", label: "标签" },
];

const recipeList = ref([...recipes]);
const ingredientList = ref([...ingredients]);
const tagList = ref([...tags]);

const editingIngredient = ref<{
  id: string;
  name: string;
  description: string;
  image: string;
  video: string;
  price: string;
} | null>(null);
const editingTag = ref<{ id: string; name: string } | null>(null);
const confirmDialog = ref<{ message: string; onConfirm: () => void } | null>(
  null,
);

// ── Recipe operations ──

const confirmDeleteRecipe = (recipe: { id: string; name: string }) => {
  confirmDialog.value = {
    message: t("确认删除此食谱？"),
    onConfirm: async () => {
      const { onDeleteRecipe } = await import("../../recipes/recipes.telefunc");
      await onDeleteRecipe(recipe.id);
      recipeList.value = recipeList.value.filter((r) => r.id !== recipe.id);
    },
  };
};

// ── Ingredient operations ──

const saveIngredient = async () => {
  if (!editingIngredient.value || !editingIngredient.value.name) return;
  const data = editingIngredient.value;

  if (data.id) {
    const { onUpdateIngredient } = await import("../ingredients.telefunc");
    const updated = await onUpdateIngredient(data.id, {
      name: data.name,
      description: data.description || undefined,
      image: data.image || undefined,
      video: data.video || undefined,
      price: data.price || undefined,
    });
    if (updated) {
      const idx = ingredientList.value.findIndex((i) => i.id === data.id);
      if (idx >= 0) ingredientList.value[idx] = updated;
    }
  } else {
    const { onCreateIngredient } = await import("../ingredients.telefunc");
    const created = await onCreateIngredient({
      name: data.name,
      description: data.description || undefined,
      image: data.image || undefined,
      video: data.video || undefined,
      price: data.price || undefined,
    });
    ingredientList.value.push(created);
  }
  editingIngredient.value = null;
};

const confirmDeleteIngredient = (ing: { id: string; name: string }) => {
  confirmDialog.value = {
    message: t("确认删除此食材？"),
    onConfirm: async () => {
      const { onDeleteIngredient } = await import("../ingredients.telefunc");
      await onDeleteIngredient(ing.id);
      ingredientList.value = ingredientList.value.filter(
        (i) => i.id !== ing.id,
      );
    },
  };
};

// ── Tag operations ──

const saveTag = async () => {
  if (!editingTag.value || !editingTag.value.name) return;
  const data = editingTag.value;

  if (data.id) {
    const { onUpdateTag } = await import("../tags.telefunc");
    const updated = await onUpdateTag(data.id, data.name);
    if (updated) {
      const idx = tagList.value.findIndex((t) => t.id === data.id);
      if (idx >= 0) tagList.value[idx] = updated;
    }
  } else {
    const { onCreateTag } = await import("../tags.telefunc");
    const created = await onCreateTag(data.name);
    tagList.value.push(created);
  }
  editingTag.value = null;
};

const confirmDeleteTag = (tag: { id: string; name: string }) => {
  confirmDialog.value = {
    message: t("确认删除此标签？"),
    onConfirm: async () => {
      const { onDeleteTag } = await import("../tags.telefunc");
      await onDeleteTag(tag.id);
      tagList.value = tagList.value.filter((t) => t.id !== tag.id);
    },
  };
};
</script>
