<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  items: { image: string; time: number }[];
}>();

const rows = computed(() => {
  if (props.items.length === 0) return [];

  // Sort by time descending so bigger dishes appear first
  const sorted = [...props.items].sort((a, b) => b.time - a.time);

  // Pack into rows of ~2 items each
  const perRow = sorted.length === 1 ? 1 : 2;
  const result: { image: string; flex: number }[][] = [];

  for (let i = 0; i < sorted.length; i += perRow) {
    const row = sorted.slice(i, i + perRow);
    result.push(row.map((item) => ({ image: item.image, flex: item.time })));
  }

  return result;
});

const rowHeight = computed(() =>
  rows.value.length > 0 ? `${100 / rows.value.length}%` : "0",
);
</script>

<template>
  <div
    v-if="rows.length > 0"
    class="flex h-48 w-full flex-col overflow-hidden bg-muted"
  >
    <div
      v-for="(row, ri) in rows"
      :key="ri"
      class="flex min-h-0"
      :style="{ height: rowHeight }"
    >
      <div
        v-for="(item, ci) in row"
        :key="ci"
        class="min-w-0 overflow-hidden"
        :style="{ flex: item.flex }"
      >
        <img
          :src="item.image"
          alt=""
          class="h-full w-full object-cover object-center"
          loading="lazy"
        />
      </div>
    </div>
  </div>
  <div
    v-else
    class="flex h-32 w-full items-center justify-center bg-muted text-4xl"
  >
    🍽️
  </div>
</template>
