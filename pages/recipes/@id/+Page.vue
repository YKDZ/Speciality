<template>
  <div>
    <!-- Slideshow Mode -->
    <SlideshowView
      v-if="slideshowMode"
      :steps="steps"
      :recipe-name="recipe.name"
      @exit="slideshowMode = false"
    />

    <!-- Normal Detail View -->
    <div v-else>
      <!-- Back & Actions -->
      <div class="mb-6 flex items-center justify-between">
        <a
          href="/recipes"
          class="inline-flex items-center gap-1 text-sm text-[var(--color-on-surface-muted)] hover:text-[var(--color-primary)]"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {{ t("返回") }}
        </a>
        <div class="flex items-center gap-2">
          <button
            v-if="steps.length > 0"
            class="inline-flex items-center gap-1.5 rounded border border-[var(--color-border)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-hover)]"
            @click="slideshowMode = true"
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
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ t("幻灯片模式") }}
          </button>
          <a
            :href="`/recipes/${recipe.id}/edit`"
            class="inline-flex items-center gap-1.5 rounded bg-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)]"
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
            class="h-24 w-24 shrink-0 rounded border border-[var(--color-border)] object-cover"
            loading="lazy"
          />
        </div>

        <h1 class="text-3xl font-bold tracking-tight">{{ recipe.name }}</h1>
        <p
          v-if="recipe.description"
          class="mt-2 text-[var(--color-on-surface-muted)]"
        >
          {{ recipe.description }}
        </p>

        <!-- Meta row -->
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <span
            v-if="recipe.estimatedTime"
            class="inline-flex items-center gap-1 rounded border border-[var(--color-border)] px-2.5 py-1 text-xs"
          >
            <svg
              class="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ recipe.estimatedTime }} {{ t("分钟") }}
          </span>
          <span
            v-for="tag in tags"
            :key="tag.tagId"
            class="rounded-full bg-[var(--color-primary-light)] px-2.5 py-1 text-xs text-[var(--color-primary)]"
          >
            {{ tag.tagName }}
          </span>
        </div>

        <!-- Video -->
        <div v-if="recipe.video" class="mt-4">
          <video controls class="w-full rounded" :src="recipe.video"></video>
        </div>
      </div>

      <!-- Ingredients -->
      <section v-if="ingredients.length > 0" class="mb-8">
        <h2 class="mb-3 text-xl font-semibold">{{ t("食材列表") }}</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr
                class="border-b border-[var(--color-border)] text-left text-[var(--color-on-surface-muted)]"
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
                class="border-b border-[var(--color-border)]"
              >
                <td class="py-2">
                  <div class="flex items-center gap-2">
                    <img
                      v-if="item.ingredientImage"
                      :src="item.ingredientImage"
                      class="h-6 w-6 rounded-full object-cover"
                    />
                    {{ item.ingredientName }}
                  </div>
                </td>
                <td class="py-2">{{ item.amount || "—" }}</td>
                <td class="py-2 text-[var(--color-on-surface-muted)]">
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
            class="rounded border border-[var(--color-border)] p-4"
          >
            <div class="mb-2 text-xs font-semibold text-[var(--color-primary)]">
              {{
                t("步骤 {current}/{total}", {
                  current: idx + 1,
                  total: steps.length,
                })
              }}
            </div>
            <div
              class="prose-sm leading-relaxed whitespace-pre-wrap"
              v-text="step.content"
            />
          </li>
        </ol>
      </section>

      <!-- Reviews -->
      <ReviewSection :recipe-id="recipe.id" :initial-reviews="reviews" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useData } from "vike-vue/useData";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import ReviewSection from "@/components/ReviewSection.vue";
import SlideshowView from "@/components/SlideshowView.vue";

import type { Data } from "./+data";

const { t } = useI18n();
const { recipe, steps, images, ingredients, tags, reviews } = useData<Data>();
const slideshowMode = ref(false);
</script>
