<script setup lang="ts">
import {
  GripHorizontal,
  MoreVertical,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-vue-next";
import Sortable from "sortablejs";
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";

import type { Ingredient } from "@/database/drizzle/schema/ingredients";
import type { Tag } from "@/database/drizzle/schema/tags";

import IngredientCombobox from "@/components/IngredientCombobox.vue";
import TagMultiSelect from "@/components/TagMultiSelect.vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UnitCombobox from "@/components/UnitCombobox.vue";
import { UNIT_CONVERSIONS } from "@/lib/units";

import MarkdownEditor from "./MarkdownEditor.vue";
import {
  onCreateIngredient,
  onCreateTag,
  onUploadFile,
} from "./RecipeForm.telefunc";

interface FormStep {
  content: string;
  sortOrder: number;
  name?: string;
}

interface FormIngredient {
  ingredientId: string;
  quantity?: string;
  unit?: string;
  note?: string;
}

interface FormData {
  name: string;
  description: string;
  estimatedTime?: number;
  coverImage: string;
  steps: FormStep[];
  tagIds: string[];
  ingredients: FormIngredient[];
}

const { t } = useI18n();

const props = defineProps<{
  initialData?: FormData;
  allIngredients: Ingredient[];
  allTags: Tag[];
}>();

const emit = defineEmits<{
  save: [data: FormData];
}>();

const allTagsLocal = ref<Tag[]>([...props.allTags]);
const allIngredientsLocal = ref<Ingredient[]>([...props.allIngredients]);

const form = reactive<FormData>(
  props.initialData
    ? {
        ...props.initialData,
        steps: props.initialData.steps.map((step) => ({ ...step })),
        tagIds: [...props.initialData.tagIds],
        ingredients: props.initialData.ingredients.map((item) => ({ ...item })),
      }
    : {
        name: "",
        description: "",
        estimatedTime: undefined,
        coverImage: "",
        steps: [],
        tagIds: [],
        ingredients: [],
      },
);

const showNewIngredientDialog = ref(false);
const newIngredient = reactive({ name: "", description: "" });
const stepsContainerRef = ref<HTMLElement | null>(null);
const ingredientsContainerRef = ref<HTMLElement | null>(null);

const reorderSteps = () => {
  form.steps.forEach((step, idx) => {
    step.sortOrder = idx;
  });
};

const addStep = () => {
  form.steps.push({
    content: "",
    sortOrder: form.steps.length,
    name: "",
  });
};

const insertStepAt = (index: number) => {
  form.steps.splice(index, 0, {
    content: "",
    sortOrder: index,
    name: "",
  });
  reorderSteps();
};

const removeStep = (idx: number) => {
  form.steps.splice(idx, 1);
  reorderSteps();
};

const sortableOptions: Sortable.Options = {
  animation: 150,
  forceFallback: true,
  fallbackOnBody: true,
  scroll: true,
  scrollSensitivity: 80,
  bubbleScroll: true,
  delay: 150,
  delayOnTouchOnly: true,
  touchStartThreshold: 5,
};

const revertDom = (evt: Sortable.SortableEvent, oldIndex: number) => {
  evt.item.remove();
  const { children } = evt.from;
  if (oldIndex < children.length) {
    evt.from.insertBefore(evt.item, children[oldIndex]);
  } else {
    evt.from.appendChild(evt.item);
  }
};

let stepsSortable: Sortable | null = null;
let ingredientsSortable: Sortable | null = null;

onMounted(() => {
  if (stepsContainerRef.value) {
    stepsSortable = Sortable.create(stepsContainerRef.value, {
      ...sortableOptions,
      handle: ".drag-handle",
      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt;
        if (
          oldIndex === undefined ||
          newIndex === undefined ||
          oldIndex === newIndex
        )
          return;
        revertDom(evt, oldIndex);
        const [moved] = form.steps.splice(oldIndex, 1);
        form.steps.splice(newIndex, 0, moved);
        reorderSteps();
      },
    });
  }
  if (ingredientsContainerRef.value) {
    ingredientsSortable = Sortable.create(ingredientsContainerRef.value, {
      ...sortableOptions,
      handle: ".ingredient-drag-handle",
      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt;
        if (
          oldIndex === undefined ||
          newIndex === undefined ||
          oldIndex === newIndex
        )
          return;
        revertDom(evt, oldIndex);
        const [moved] = form.ingredients.splice(oldIndex, 1);
        form.ingredients.splice(newIndex, 0, moved);
      },
    });
  }
});

onBeforeUnmount(() => {
  stepsSortable?.destroy();
  ingredientsSortable?.destroy();
});

const moveStepUp = (idx: number) => {
  if (idx <= 0) return;
  const [moved] = form.steps.splice(idx, 1);
  form.steps.splice(idx - 1, 0, moved);
  reorderSteps();
};

const moveStepDown = (idx: number) => {
  if (idx >= form.steps.length - 1) return;
  const [moved] = form.steps.splice(idx, 1);
  form.steps.splice(idx + 1, 0, moved);
  reorderSteps();
};

const moveIngredientUp = (idx: number) => {
  if (idx <= 0) return;
  const [moved] = form.ingredients.splice(idx, 1);
  form.ingredients.splice(idx - 1, 0, moved);
};

const moveIngredientDown = (idx: number) => {
  if (idx >= form.ingredients.length - 1) return;
  const [moved] = form.ingredients.splice(idx, 1);
  form.ingredients.splice(idx + 1, 0, moved);
};

const unitList = Object.keys(UNIT_CONVERSIONS);

const addIngredientRow = () => {
  form.ingredients.push({ ingredientId: "", quantity: "", unit: "", note: "" });
};

const getFirstFileFromEvent = (event: Event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return null;
  }

  return target.files?.[0] ?? null;
};

const uploadAsset = async (event: Event, field: "coverImage") => {
  const file = getFirstFileFromEvent(event);
  if (!file) {
    return;
  }

  try {
    const data = await onUploadFile(file);
    form[field] = data.url;
  } catch {
    toast.error(t("上传失败，请稍后重试"));
  } finally {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      target.value = "";
    }
  }
};

const uploadCoverImage = async (event: Event) => {
  await uploadAsset(event, "coverImage");
};

const createTagInline = async (name: string) => {
  const normalizedName = name.trim();
  if (!normalizedName) {
    return;
  }

  const created = await onCreateTag(normalizedName);
  allTagsLocal.value.push(created);

  if (!form.tagIds.includes(created.id)) {
    form.tagIds.push(created.id);
  }
};

const createIngredientInline = async () => {
  if (!newIngredient.name.trim()) {
    return;
  }

  const created = await onCreateIngredient({
    name: newIngredient.name.trim(),
    description: newIngredient.description || undefined,
  });

  allIngredientsLocal.value.push(created);
  form.ingredients.push({
    ingredientId: created.id,
    quantity: "",
    unit: "",
    note: "",
  });
  newIngredient.name = "";
  newIngredient.description = "";
  showNewIngredientDialog.value = false;
};

const IMAGE_RE = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/;

const extractFirstImage = (description: string, steps: FormStep[]) => {
  const descMatch = description.match(IMAGE_RE);
  if (descMatch?.[1]) return descMatch[1];

  for (const step of steps) {
    const match = step.content.match(IMAGE_RE);
    if (match?.[1]) return match[1];
  }

  return "";
};

const onSubmit = () => {
  reorderSteps();

  const validIngredients = form.ingredients
    .filter((item) => item.ingredientId)
    .map((item) => ({ ...item }));
  const coverImage =
    form.coverImage || extractFirstImage(form.description, form.steps);

  emit("save", {
    ...form,
    coverImage,
    steps: form.steps.map((step) => ({ ...step })),
    tagIds: [...form.tagIds],
    ingredients: validIngredients,
  });
};
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <div>
      <Label class="mb-1 block text-sm font-medium">{{ t("食谱名称") }}</Label>
      <Input v-model="form.name" type="text" required />
    </div>

    <div>
      <Label class="mb-1 block text-sm font-medium">{{ t("简介") }}</Label>
      <MarkdownEditor v-model="form.description" />
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label class="mb-1 block text-sm font-medium">{{
          t("预计用时（分钟）")
        }}</Label>
        <Input v-model.number="form.estimatedTime" type="number" min="1" />
      </div>
      <div>
        <Label class="mb-1 block text-sm font-medium">{{
          t("封面图片")
        }}</Label>
        <div v-if="form.coverImage" class="mb-2">
          <img
            :src="form.coverImage"
            :alt="t('封面预览')"
            class="h-24 w-auto rounded border border-(--color-border) object-cover"
          />
        </div>
        <div class="flex items-center gap-2">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            @change="uploadCoverImage"
          />
          <Button
            v-if="form.coverImage"
            variant="destructive"
            size="sm"
            @click="form.coverImage = ''"
          >
            {{ t("移除封面") }}
          </Button>
        </div>
        <p class="mt-1 text-xs text-(--color-on-surface-muted)">
          {{ t("若未上传封面，将自动使用步骤中的首张图片") }}
        </p>
      </div>
    </div>

    <div>
      <Label class="mb-2 block text-sm font-medium">{{ t("标签列表") }}</Label>
      <TagMultiSelect
        v-model="form.tagIds"
        :tags="allTagsLocal"
        @create="createTagInline"
      />
      <p
        v-if="allTagsLocal.length === 0"
        class="mt-2 text-xs text-(--color-on-surface-muted)"
      >
        {{ t("暂无标签") }}
      </p>
    </div>

    <div>
      <Label class="mb-2 block text-sm font-medium">{{ t("食材列表") }}</Label>
      <div ref="ingredientsContainerRef" class="space-y-4 sm:space-y-2">
        <div
          v-for="(item, idx) in form.ingredients"
          :key="idx"
          class="flex flex-col gap-2 rounded-lg border border-(--color-border) p-3 sm:flex-row sm:items-center sm:rounded-none sm:border-0 sm:p-0"
        >
          <span
            class="ingredient-drag-handle hidden cursor-grab text-(--color-on-surface-muted) hover:text-(--color-primary) sm:block"
          >
            <GripHorizontal class="h-4 w-4" />
          </span>
          <div class="flex items-center gap-0.5 sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              class="h-7 w-7"
              :disabled="idx === 0"
              @click="moveIngredientUp(idx)"
            >
              <ArrowUp />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="h-7 w-7"
              :disabled="idx === form.ingredients.length - 1"
              @click="moveIngredientDown(idx)"
            >
              <ArrowDown />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="ml-auto h-7 w-7 shrink-0 text-(--color-danger) hover:text-(--color-danger)"
              :title="t('移除食材')"
              @click="form.ingredients.splice(idx, 1)"
            >
              <X class="h-4 w-4" />
            </Button>
          </div>
          <IngredientCombobox
            v-model="item.ingredientId"
            :ingredients="allIngredientsLocal"
          />
          <Input
            v-model="item.quantity"
            type="text"
            :placeholder="t('数量')"
            class="sm:w-20"
          />
          <UnitCombobox v-model="item.unit" :units="unitList" class="sm:w-24" />
          <Input
            v-model="item.note"
            type="text"
            :placeholder="t('备注')"
            class="sm:w-40"
          />
          <Button
            variant="ghost"
            size="icon"
            class="hidden shrink-0 text-(--color-danger) hover:text-(--color-danger) sm:inline-flex"
            :title="t('移除食材')"
            @click="form.ingredients.splice(idx, 1)"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div class="mt-2 flex gap-2">
        <Button variant="outline" size="sm" @click="addIngredientRow">
          <Plus class="size-4" />{{ t("添加食材") }}
        </Button>
        <Dialog v-model:open="showNewIngredientDialog">
          <DialogTrigger as-child>
            <Button variant="outline" size="sm">
              <Plus class="size-4" />{{ t("新建食材") }}
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{{ t("新建食材") }}</DialogTitle>
            </DialogHeader>
            <div class="space-y-3 py-2">
              <div>
                <Label class="mb-1 block text-sm font-medium">{{
                  t("名称")
                }}</Label>
                <Input v-model="newIngredient.name" type="text" />
              </div>
              <div>
                <Label class="mb-1 block text-sm font-medium">{{
                  t("描述")
                }}</Label>
                <Input v-model="newIngredient.description" type="text" />
              </div>
            </div>
            <DialogFooter>
              <Button @click="createIngredientInline">{{ t("保存") }}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <div>
      <Label class="mb-2 block text-sm font-medium">{{ t("步骤") }}</Label>
      <div ref="stepsContainerRef" class="space-y-1">
        <template v-for="(step, idx) in form.steps" :key="idx">
          <!-- 步骤卡片 -->
          <div class="rounded border border-(--color-border) p-4">
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="drag-handle hidden cursor-grab text-(--color-on-surface-muted) hover:text-(--color-primary) sm:block"
                >
                  <GripHorizontal class="h-4 w-4" />
                </span>
                <div class="flex gap-0.5 sm:hidden">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    :disabled="idx === 0"
                    @click="moveStepUp(idx)"
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    :disabled="idx === form.steps.length - 1"
                    @click="moveStepDown(idx)"
                  >
                    <ArrowDown />
                  </Button>
                </div>
                <span class="text-xs font-semibold text-(--color-primary)">
                  {{
                    t("步骤 {current}/{total}", {
                      current: idx + 1,
                      total: form.steps.length,
                    })
                  }}
                </span>
              </div>
              <div class="flex items-center gap-0.5">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-7 w-7">
                      <MoreVertical class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem @click="insertStepAt(idx)">
                      {{ t("在上方新建步骤") }}
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="insertStepAt(idx + 1)">
                      {{ t("在下方新建步骤") }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-7 w-7 text-(--color-danger) hover:text-(--color-danger)"
                  @click="removeStep(idx)"
                >
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Input
              v-model="step.name"
              type="text"
              :placeholder="t('步骤名称（可选）')"
              class="mb-2"
            />
            <MarkdownEditor v-model="step.content" />
          </div>
        </template>
      </div>
      <Button variant="outline" class="mt-4 w-full" @click="addStep">
        <Plus class="size-4" />
        {{ t("添加步骤") }}
      </Button>
    </div>

    <div class="flex gap-3 border-t border-(--color-border) pt-6">
      <Button type="submit">{{ t("保存") }}</Button>
    </div>
  </form>
</template>
