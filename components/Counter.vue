<template>
  <button
    type="button"
    class="inline-block rounded border border-black bg-gray-200 px-2 py-1 text-xs leading-normal font-medium uppercase"
    @click="state.count++"
  >
    Counter {{ state.count }}
  </button>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const state = reactive({ count: 0 });
</script>
