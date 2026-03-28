<template>
  <section>
    <h2 class="mb-3 text-xl font-semibold">{{ t("评价") }}</h2>

    <!-- Existing reviews -->
    <div
      v-if="reviews.length === 0"
      class="mb-4 text-sm text-[var(--color-on-surface-muted)]"
    >
      {{ t("暂无评价") }}
    </div>
    <div v-else class="mb-6 space-y-3">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="rounded border border-[var(--color-border)] p-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-medium">{{ review.author }}</span>
            <span class="text-sm text-yellow-500"
              >{{ "★".repeat(review.rating)
              }}{{ "☆".repeat(5 - review.rating) }}</span
            >
          </div>
          <span class="text-xs text-[var(--color-on-surface-muted)]">
            {{ new Date(review.createdAt).toLocaleDateString() }}
          </span>
        </div>
        <p v-if="review.comment" class="mt-2 text-sm">{{ review.comment }}</p>
      </div>
    </div>

    <!-- Add review form -->
    <div class="rounded border border-[var(--color-border)] p-4">
      <h3 class="mb-3 text-sm font-semibold">{{ t("添加评价") }}</h3>
      <div class="space-y-3">
        <div>
          <label
            class="mb-1 block text-xs font-medium text-[var(--color-on-surface-muted)]"
            >{{ t("评价者") }}</label
          >
          <input
            v-model="newReview.author"
            type="text"
            class="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div>
          <label
            class="mb-1 block text-xs font-medium text-[var(--color-on-surface-muted)]"
            >{{ t("评分") }}</label
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
          <label
            class="mb-1 block text-xs font-medium text-[var(--color-on-surface-muted)]"
            >{{ t("评论") }}</label
          >
          <textarea
            v-model="newReview.comment"
            rows="3"
            class="w-full resize-none rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <button
          class="rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-40"
          :disabled="!newReview.author || !newReview.rating || submitting"
          @click="submitReview"
        >
          {{ t("提交") }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

import type { Review } from "@/database/drizzle/schema/relations";

const { t } = useI18n();

const props = defineProps<{
  recipeId: string;
  initialReviews: Review[];
}>();

const reviews = ref<Review[]>([...props.initialReviews]);
const submitting = ref(false);

const newReview = reactive({
  author: "",
  rating: 0,
  comment: "",
});

const submitReview = async () => {
  if (!newReview.author || !newReview.rating) return;
  submitting.value = true;
  try {
    const { onCreateReview } =
      await import("../pages/recipes/recipes.telefunc");
    const created = await onCreateReview({
      recipeId: props.recipeId,
      author: newReview.author,
      rating: newReview.rating,
      comment: newReview.comment || undefined,
    });
    reviews.value.push(created);
    newReview.author = "";
    newReview.rating = 0;
    newReview.comment = "";
  } finally {
    submitting.value = false;
  }
};
</script>
