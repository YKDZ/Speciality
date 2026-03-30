<script setup lang="ts">
import { useData } from "vike-vue/useData";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Data } from "./+data";

import ComboCoverGrid from "./ComboCoverGrid.vue";

const { t } = useI18n();
const data = useData<Data>();

const combos = ref(data.combos);
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t("搭配") }}</h1>
      <Button as-child>
        <a href="/combos/new">{{ t("新建搭配") }}</a>
      </Button>
    </div>

    <p v-if="combos.length === 0" class="text-muted-foreground">
      {{ t("暂无搭配") }}
    </p>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <a
        v-for="combo in combos"
        :key="combo.id"
        :href="`/combos/${combo.id}`"
        class="block"
      >
        <Card class="overflow-hidden py-0 transition-shadow hover:shadow-md">
          <!-- Cover -->
          <div
            v-if="combo.coverImage"
            class="relative aspect-video w-full overflow-hidden bg-muted"
          >
            <img
              :src="combo.coverImage"
              :alt="combo.name"
              class="absolute inset-0 h-full w-full object-cover"
              style="object-fit: cover"
              loading="lazy"
            />
          </div>
          <ComboCoverGrid v-else :items="combo.recipeCoverItems" />

          <CardHeader>
            <CardTitle>{{ combo.name }}</CardTitle>
            <CardDescription v-if="combo.description">{{
              combo.description
            }}</CardDescription>
          </CardHeader>
          <CardContent class="text-sm text-muted-foreground">
            <span>{{ t("包含食谱") }}: {{ combo.recipeCount }}</span>
            <span v-if="combo.totalTime" class="ml-4">
              {{ t("总时长") }}: {{ combo.totalTime }} {{ t("分钟") }}
            </span>
          </CardContent>
        </Card>
      </a>
    </div>
  </div>
</template>
