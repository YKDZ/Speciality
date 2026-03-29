<script setup lang="ts">
import MarkdownIt from "markdown-it";
import { computed } from "vue";

const props = defineProps<{
  content: string;
}>();

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

const rendered = computed(() => md.render(props.content || ""));
</script>

<template>
  <div class="prose-recipe" v-html="rendered" />
</template>

<style>
.prose-recipe {
  padding: 0;
  outline: none;
  line-height: 1.7;
}
.prose-recipe p {
  margin: 0.25em 0;
}
.prose-recipe h1,
.prose-recipe h2,
.prose-recipe h3 {
  font-weight: 600;
  margin-top: 0.75em;
  margin-bottom: 0.25em;
}
.prose-recipe img {
  max-width: 100%;
  border-radius: 4px;
}
.prose-recipe code {
  background: var(--color-surface-alt);
  padding: 0.15em 0.35em;
  border-radius: 3px;
  font-size: 0.9em;
}
.prose-recipe pre {
  background: var(--color-surface-alt);
  padding: 0.75em 1em;
  border-radius: 4px;
  overflow-x: auto;
}
.prose-recipe pre code {
  background: none;
  padding: 0;
}
.prose-recipe ul {
  list-style: disc;
  padding-left: 1.5em;
}
.prose-recipe ol {
  list-style: decimal;
  padding-left: 1.5em;
}
.prose-recipe blockquote {
  border-left: 3px solid var(--color-border);
  padding-left: 1em;
  color: var(--color-on-surface-muted);
}
.prose-recipe table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5em 0;
}
.prose-recipe th,
.prose-recipe td {
  border: 1px solid var(--color-border);
  padding: 0.4em 0.75em;
  text-align: left;
}
.prose-recipe th {
  font-weight: 600;
  background: var(--color-surface-alt);
}
.prose-recipe a {
  color: var(--color-primary);
  text-decoration: underline;
}
.prose-recipe hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1em 0;
}
</style>
