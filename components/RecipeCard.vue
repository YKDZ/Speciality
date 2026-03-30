<script setup lang="ts">
import { Clock } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const { t } = useI18n();

defineProps<{
  recipe: {
    id: string;
    name: string;
    description?: string | null;
    coverImage?: string | null;
    estimatedTime?: number | null;
    tags: { tagId: string; tagName: string }[];
  };
}>();
</script>

<template>
  <a :href="`/recipes/${recipe.id}`" class="block">
    <Card class="overflow-hidden py-0 transition-shadow hover:shadow-md">
      <!-- Cover Image -->
      <div
        v-if="recipe.coverImage"
        class="relative aspect-video w-full overflow-hidden bg-muted"
      >
        <img
          :src="recipe.coverImage"
          :alt="recipe.name"
          class="absolute inset-0 h-full w-full object-cover"
          style="object-fit: cover"
          loading="lazy"
        />
      </div>
      <div
        v-else
        class="flex aspect-video w-full items-center justify-center bg-muted text-4xl"
      >
        🍽️
      </div>

      <CardContent class="p-4">
        <h3 class="text-base leading-snug font-semibold">{{ recipe.name }}</h3>
        <p
          v-if="recipe.description"
          class="mt-1 line-clamp-2 text-sm text-muted-foreground"
        >
          {{ recipe.description }}
        </p>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <Badge v-if="recipe.estimatedTime" variant="outline">
            <Clock class="mr-1 h-3 w-3" />
            {{ recipe.estimatedTime }}{{ t("分钟") }}
          </Badge>
          <Badge
            v-for="tag in recipe.tags"
            :key="tag.tagId"
            variant="secondary"
          >
            {{ tag.tagName }}
          </Badge>
        </div>
      </CardContent>
    </Card>
  </a>
</template>
