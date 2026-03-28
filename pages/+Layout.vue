<!-- https://vike.dev/Layout -->

<template>
  <div
    class="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)]"
  >
    <AppHeader />
    <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div id="page-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import AppHeader from "@/components/AppHeader.vue";
</script>

<style>
/* Page Transition Animation */
#page-content {
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}
body.page-transition #page-content {
  opacity: 0;
}
</style>
