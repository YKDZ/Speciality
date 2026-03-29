<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { usePageContext } from "vike-vue/usePageContext";
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

import type { Review } from "@/database/drizzle/schema/relations";

import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { onCreateReview } from "./ReviewSection.telefunc";

const { t } = useI18n();
const pageContext = usePageContext();

const reviewsEnabled = pageContext.globalContext.reviewsEnabled;

const props = defineProps<{
  recipeId: string;
  initialReviews: Review[];
}>();

const reviews = ref<Review[]>([...props.initialReviews]);
const submitting = ref(false);

const savedAuthor = useLocalStorage("review-author", "");

const newReview = reactive({
  author: savedAuthor.value,
  rating: 0,
  comment: "",
});

const submitReview = async () => {
  if (!newReview.author || !newReview.rating) return;
  submitting.value = true;
  try {
    const created = await onCreateReview({
      recipeId: props.recipeId,
      author: newReview.author,
      rating: newReview.rating,
      comment: newReview.comment || undefined,
    });
    reviews.value.push(created);
    savedAuthor.value = newReview.author;
    newReview.rating = 0;
    newReview.comment = "";
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <section v-if="reviewsEnabled">
    <h2 class="mb-3 text-xl font-semibold">{{ t("评价") }}</h2>

    <!-- Existing reviews -->
    <div
      v-if="reviews.length === 0"
      class="mb-4 text-sm text-(--color-on-surface-muted)"
    >
      {{ t("暂无评价") }}
    </div>
    <div v-else class="mb-6 space-y-3">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="rounded border border-(--color-border) p-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-medium">{{ review.author }}</span>
            <span class="text-sm text-yellow-500"
              >{{ "★".repeat(review.rating)
              }}{{ "☆".repeat(5 - review.rating) }}</span
            >
          </div>
          <span class="text-xs text-(--color-on-surface-muted)">
            {{ new Date(review.createdAt).toLocaleDateString() }}
          </span>
        </div>
        <MarkdownRenderer
          v-if="review.comment"
          :content="review.comment"
          class="mt-2 text-sm"
        />
      </div>
    </div>

    <!-- Add review form -->
    <div class="rounded border border-(--color-border) p-4">
      <h3 class="mb-3 text-sm font-semibold">{{ t("添加评价") }}</h3>
      <div class="space-y-3">
        <div>
          <Label
            class="mb-1 block text-xs font-medium text-(--color-on-surface-muted)"
            >{{ t("评价者") }}</Label
          >
          <Input v-model="newReview.author" type="text" />
        </div>
        <div>
          <Label
            class="mb-1 block text-xs font-medium text-(--color-on-surface-muted)"
            >{{ t("评分") }}</Label
          >
          <div class="flex gap-1">
            <button
              v-for="star in 5"
              :key="star"
              class="text-2xl transition-colors"
              :class="
                star <= newReview.rating ? 'text-yellow-500' : 'text-gray-300'
              "
              @click="newReview.rating = star"
            >
              ★
            </button>
          </div>
        </div>
        <div>
          <Label
            class="mb-1 block text-xs font-medium text-(--color-on-surface-muted)"
            >{{ t("评论") }}</Label
          >
          <Textarea v-model="newReview.comment" :rows="3" class="resize-none" />
        </div>
        <Button
          :disabled="!newReview.author || !newReview.rating || submitting"
          @click="submitReview"
        >
          {{ t("提交") }}
        </Button>
      </div>
    </div>
  </section>
</template>
