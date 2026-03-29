<script setup lang="ts">
import { GripHorizontal } from "lucide-vue-next";
import Sortable from "sortablejs";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { onUploadFile } from "./ComboForm.telefunc";

const { t } = useI18n();

interface Recipe {
  id: string;
  name: string;
}

interface ComboFormData {
  name: string;
  description: string;
  estimatedTime: number | null;
  coverImage: string;
  selectedRecipeIds: string[];
}

const props = defineProps<{
  allRecipes: Recipe[];
  initialData?: Partial<ComboFormData>;
}>();

const emit = defineEmits<{
  save: [data: ComboFormData];
}>();

const name = ref(props.initialData?.name ?? "");
const description = ref(props.initialData?.description ?? "");
const estimatedTimeStr = ref(
  props.initialData?.estimatedTime !== null &&
    props.initialData?.estimatedTime !== undefined
    ? String(props.initialData.estimatedTime)
    : "",
);
const coverImage = ref(props.initialData?.coverImage ?? "");
const selectedRecipeIds = ref<string[]>(
  props.initialData?.selectedRecipeIds ?? [],
);

const estimatedTime = computed(() => {
  const n = Number(estimatedTimeStr.value);
  return estimatedTimeStr.value.trim() !== "" && !isNaN(n) && n > 0 ? n : null;
});

const toggleRecipe = (id: string) => {
  const idx = selectedRecipeIds.value.indexOf(id);
  if (idx === -1) {
    selectedRecipeIds.value = [...selectedRecipeIds.value, id];
  } else {
    selectedRecipeIds.value = selectedRecipeIds.value.filter((r) => r !== id);
  }
};

const moveUp = (idx: number) => {
  if (idx === 0) return;
  const arr = [...selectedRecipeIds.value];
  [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
  selectedRecipeIds.value = arr;
};

const moveDown = (idx: number) => {
  if (idx === selectedRecipeIds.value.length - 1) return;
  const arr = [...selectedRecipeIds.value];
  [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
  selectedRecipeIds.value = arr;
};

const recipeMap = computed(
  () => new Map(props.allRecipes.map((r) => [r.id, r])),
);

const uploadCoverImage = async (event: Event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const file = target.files?.[0];
  if (!file) return;

  try {
    const data = await onUploadFile(file);
    coverImage.value = data.url;
  } catch {
    toast.error(t("上传失败，请稍后重试"));
  } finally {
    if (target instanceof HTMLInputElement) target.value = "";
  }
};

const recipeSearchQuery = ref("");
const filteredRecipes = computed(() => {
  const q = recipeSearchQuery.value.trim().toLowerCase();
  if (!q) return props.allRecipes;
  return props.allRecipes.filter((r) => r.name.toLowerCase().includes(q));
});

const selectedRecipesRef = ref<HTMLElement | null>(null);
let recipesSortable: Sortable | null = null;

watch(
  selectedRecipesRef,
  (el) => {
    recipesSortable?.destroy();
    recipesSortable = null;
    if (el) {
      recipesSortable = Sortable.create(el, {
        handle: ".recipe-drag-handle",
        animation: 150,
        forceFallback: true,
        fallbackOnBody: true,
        scroll: true,
        scrollSensitivity: 80,
        bubbleScroll: true,
        delay: 150,
        delayOnTouchOnly: true,
        touchStartThreshold: 5,
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt;
          if (
            oldIndex === undefined ||
            newIndex === undefined ||
            oldIndex === newIndex
          )
            return;
          evt.item.remove();
          const { children } = evt.from;
          if (oldIndex < children.length) {
            evt.from.insertBefore(evt.item, children[oldIndex]);
          } else {
            evt.from.appendChild(evt.item);
          }
          const arr = [...selectedRecipeIds.value];
          const [moved] = arr.splice(oldIndex, 1);
          arr.splice(newIndex, 0, moved);
          selectedRecipeIds.value = arr;
        },
      });
    }
  },
  { flush: "post" },
);

onBeforeUnmount(() => {
  recipesSortable?.destroy();
});

const handleSubmit = () => {
  emit("save", {
    name: name.value,
    description: description.value,
    estimatedTime: estimatedTime.value,
    coverImage: coverImage.value,
    selectedRecipeIds: selectedRecipeIds.value,
  });
};
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="space-y-2">
      <Label for="combo-name">{{ t("名称") }}</Label>
      <Input
        id="combo-name"
        v-model="name"
        :placeholder="t('请输入搭配名称')"
        required
      />
    </div>

    <div class="space-y-2">
      <Label for="combo-description">{{ t("描述") }}</Label>
      <Textarea
        id="combo-description"
        v-model="description"
        :placeholder="t('简介（可选）')"
        rows="3"
      />
    </div>

    <div class="space-y-2">
      <Label for="combo-time">
        {{ t("总时长") }}（{{ t("分钟") }}）
        <span class="ml-1 text-xs text-muted-foreground">
          （{{ t("留空则自动计算") }}）
        </span>
      </Label>
      <Input
        id="combo-time"
        v-model="estimatedTimeStr"
        type="number"
        min="1"
        :placeholder="t('自动计算')"
      />
    </div>

    <div class="space-y-2">
      <Label for="combo-cover">{{ t("封面图片") }}</Label>
      <div v-if="coverImage" class="mb-2">
        <img
          :src="coverImage"
          :alt="t('封面预览')"
          class="h-24 w-auto rounded border border-(--color-border) object-cover"
        />
      </div>
      <div class="flex items-center gap-2">
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          class="block w-full cursor-pointer text-sm text-(--color-on-surface-muted) file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
          @change="uploadCoverImage"
        />
        <Button
          v-if="coverImage"
          type="button"
          variant="destructive"
          size="sm"
          @click="coverImage = ''"
        >
          {{ t("移除封面") }}
        </Button>
      </div>
    </div>

    <Separator />

    <div class="space-y-3">
      <Label>{{ t("包含食谱") }}</Label>

      <div
        v-if="selectedRecipeIds.length > 0"
        ref="selectedRecipesRef"
        class="mb-2 space-y-1"
      >
        <div
          v-for="(id, idx) in selectedRecipeIds"
          :key="id"
          class="flex items-center justify-between rounded border p-2 text-sm"
        >
          <div class="flex items-center gap-2">
            <span
              class="recipe-drag-handle hidden cursor-grab text-muted-foreground hover:text-foreground sm:block"
            >
              <GripHorizontal class="h-4 w-4" />
            </span>
            <span>{{ recipeMap.get(id)?.name ?? id }}</span>
          </div>
          <div class="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="sm:hidden"
              :disabled="idx === 0"
              @click="moveUp(idx)"
              >↑</Button
            >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="sm:hidden"
              :disabled="idx === selectedRecipeIds.length - 1"
              @click="moveDown(idx)"
              >↓</Button
            >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="text-destructive"
              @click="toggleRecipe(id)"
              >✕</Button
            >
          </div>
        </div>
      </div>

      <Input
        v-model="recipeSearchQuery"
        :placeholder="t('搜索食谱...')"
        class="mb-2"
      />

      <ScrollArea class="h-48">
        <div>
          <div
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            class="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-muted"
            :class="
              selectedRecipeIds.includes(recipe.id) ? 'bg-primary/10' : ''
            "
            @click="toggleRecipe(recipe.id)"
          >
            <span class="text-sm">{{ recipe.name }}</span>
            <span
              v-if="selectedRecipeIds.includes(recipe.id)"
              class="text-xs text-primary"
              >✓ {{ t("已选") }}</span
            >
          </div>
        </div>
      </ScrollArea>
    </div>

    <div class="flex justify-end gap-3">
      <Button type="submit">{{ t("保存") }}</Button>
    </div>
  </form>
</template>
