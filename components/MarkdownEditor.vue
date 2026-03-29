<script setup lang="ts">
import type { Node, Schema } from "@milkdown/prose/model";

import { Editor, rootCtx, defaultValueCtx } from "@milkdown/core";
import { clipboard } from "@milkdown/plugin-clipboard";
import { history } from "@milkdown/plugin-history";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { upload, uploadConfig } from "@milkdown/plugin-upload";
import { commonmark } from "@milkdown/preset-commonmark";
import { gfm } from "@milkdown/preset-gfm";
import { Decoration } from "@milkdown/prose/view";
import { nord } from "@milkdown/theme-nord";
import { useDropZone } from "@vueuse/core";
import { onMounted, onUnmounted, ref, watch } from "vue";

import { onUploadFile } from "./MarkdownEditor.telefunc";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const editorWrapper = ref<HTMLElement | null>(null);
const editorRoot = ref<HTMLElement | null>(null);
let editorInstance: { destroy: () => void } | null = null;

const { isOverDropZone } = useDropZone(editorWrapper, {
  dataTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
  ],
});

onMounted(async () => {
  if (!editorRoot.value) return;

  const uploader = async (files: FileList, schema: Schema): Promise<Node[]> => {
    const nodes: Node[] = [];
    for (const file of files) {
      // oxlint-disable-next-line no-await-in-loop
      const data = await onUploadFile(file);
      if (!data.url) continue;
      if (file.type.startsWith("image/") && schema.nodes.image) {
        const node = schema.nodes.image.create({
          src: data.url,
          alt: file.name,
        });
        nodes.push(node);
      }
    }
    return nodes;
  };

  const uploadWidgetFactory = (
    pos: number,
    spec: Parameters<typeof Decoration.widget>[2],
  ): Decoration => {
    return Decoration.widget(
      pos,
      () => {
        const el = document.createElement("span");
        el.textContent = "⏳";
        return el;
      },
      spec,
    );
  };

  const editor = await Editor.make()
    .config(nord)
    .config((ctx) => {
      ctx.set(rootCtx, editorRoot.value!);
      ctx.set(defaultValueCtx, props.modelValue);
      ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
        emit("update:modelValue", markdown);
      });
      ctx.set(uploadConfig.key, {
        uploader,
        uploadWidgetFactory,
        enableHtmlFileUploader: true,
      });
    })
    .use(commonmark)
    .use(gfm)
    .use(history)
    .use(listener)
    .use(clipboard)
    .use(upload)
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

<template>
  <div
    ref="editorWrapper"
    class="milkdown-editor rounded border border-(--color-border) bg-(--color-surface) transition-all"
    :class="{ 'bg-primary/5 ring-2 ring-primary/50': isOverDropZone }"
  >
    <div ref="editorRoot" />
  </div>
</template>

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
