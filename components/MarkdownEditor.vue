<template>
  <div
    ref="editorRoot"
    class="milkdown-editor rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
  />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const editorRoot = ref<HTMLElement | null>(null);
let editorInstance: { destroy: () => void } | null = null;

onMounted(async () => {
  if (!editorRoot.value) return;

  const { Editor, rootCtx, defaultValueCtx } = await import("@milkdown/core");
  const { commonmark } = await import("@milkdown/preset-commonmark");
  const { gfm } = await import("@milkdown/preset-gfm");
  const { history } = await import("@milkdown/plugin-history");
  const { listener, listenerCtx } = await import("@milkdown/plugin-listener");
  const { clipboard } = await import("@milkdown/plugin-clipboard");
  const { nord } = await import("@milkdown/theme-nord");

  const editor = await Editor.make()
    .config(nord)
    .config((ctx) => {
      ctx.set(rootCtx, editorRoot.value!);
      ctx.set(defaultValueCtx, props.modelValue);
      ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
        emit("update:modelValue", markdown);
      });
    })
    .use(commonmark)
    .use(gfm)
    .use(history)
    .use(listener)
    .use(clipboard)
    .create();

  editorInstance = editor;
});

onUnmounted(() => {
  editorInstance?.destroy();
});

// Note: for simplicity, we don't update the editor content when modelValue changes externally
// since this is primarily a user-input component
watch(
  () => props.modelValue,
  () => {
    // External updates are handled by re-mounting
  },
);
</script>

<style>
.milkdown-editor .ProseMirror {
  min-height: 120px;
  padding: 12px;
  outline: none;
  line-height: 1.7;
}
.milkdown-editor .ProseMirror p {
  margin: 0.25em 0;
}
.milkdown-editor .ProseMirror h1,
.milkdown-editor .ProseMirror h2,
.milkdown-editor .ProseMirror h3 {
  font-weight: 600;
  margin-top: 0.75em;
  margin-bottom: 0.25em;
}
.milkdown-editor .ProseMirror img {
  max-width: 100%;
  border-radius: 4px;
}
.milkdown-editor .ProseMirror code {
  background: var(--color-surface-alt);
  padding: 0.15em 0.35em;
  border-radius: 3px;
  font-size: 0.9em;
}
.milkdown-editor .ProseMirror pre {
  background: var(--color-surface-alt);
  padding: 0.75em 1em;
  border-radius: 4px;
  overflow-x: auto;
}
.milkdown-editor .ProseMirror ul {
  list-style: disc;
  padding-left: 1.5em;
}
.milkdown-editor .ProseMirror ol {
  list-style: decimal;
  padding-left: 1.5em;
}
.milkdown-editor .ProseMirror blockquote {
  border-left: 3px solid var(--color-border);
  padding-left: 1em;
  color: var(--color-on-surface-muted);
}
</style>
