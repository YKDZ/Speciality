<template>
  <div class="mx-auto max-w-3xl">
    <h1 class="mb-6 text-3xl font-bold tracking-tight">{{ t("AI 助手") }}</h1>

    <!-- Config Section -->
    <details class="mb-6 rounded border border-[var(--color-border)]">
      <summary class="cursor-pointer px-4 py-3 text-sm font-medium">
        LLM API {{ t("设置") }}
      </summary>
      <div class="space-y-3 border-t border-[var(--color-border)] px-4 py-3">
        <div>
          <label class="mb-1 block text-xs font-medium">API URL</label>
          <input
            v-model="agentConfig.apiUrl"
            type="url"
            placeholder="https://api.openai.com/v1/chat/completions"
            class="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium">API Key</label>
          <input
            v-model="agentConfig.apiKey"
            type="password"
            class="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium">Model</label>
          <input
            v-model="agentConfig.model"
            type="text"
            placeholder="gpt-4"
            class="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>
    </details>

    <!-- Chat Area -->
    <div
      class="mb-4 h-[60vh] overflow-y-auto rounded border border-[var(--color-border)] p-4"
    >
      <div
        v-if="chatMessages.length === 0"
        class="flex h-full items-center justify-center text-[var(--color-on-surface-muted)]"
      >
        <div class="text-center">
          <span class="text-4xl">🤖</span>
          <p class="mt-2 text-sm">{{ t("输入你的问题来开始对话") }}</p>
        </div>
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="(msg, idx) in chatMessages"
          :key="idx"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[80%] rounded px-4 py-2 text-sm leading-relaxed"
            :class="
              msg.role === 'user'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                : 'bg-[var(--color-surface-alt)]'
            "
          >
            <div class="whitespace-pre-wrap" v-text="msg.content" />
          </div>
        </div>
        <div v-if="loading" class="flex justify-start">
          <div
            class="rounded bg-[var(--color-surface-alt)] px-4 py-2 text-sm text-[var(--color-on-surface-muted)]"
          >
            {{ t("思考中...") }}
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <form class="flex gap-2" @submit.prevent="sendMessage">
      <input
        v-model="inputText"
        type="text"
        :placeholder="t('输入你的问题...')"
        :disabled="loading"
        class="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-50"
      />
      <button
        type="submit"
        :disabled="!inputText.trim() || loading || !isConfigured"
        class="rounded bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {{ t("发送") }}
      </button>
    </form>

    <p v-if="error" class="mt-2 text-sm text-[var(--color-danger)]">
      {{ error }}
    </p>
    <p
      v-if="!isConfigured"
      class="mt-2 text-xs text-[var(--color-on-surface-muted)]"
    >
      {{ t("请先配置 LLM API 设置") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

import type { ChatMessage } from "@/server/agent";

const { t } = useI18n();

const agentConfig = reactive({
  apiUrl: "https://api.openai.com/v1/chat/completions",
  apiKey: "",
  model: "gpt-4",
});

const chatMessages = ref<ChatMessage[]>([]);
const inputText = ref("");
const loading = ref(false);
const error = ref("");

const isConfigured = computed(
  () => agentConfig.apiUrl && agentConfig.apiKey && agentConfig.model,
);

const sendMessage = async () => {
  const text = inputText.value.trim();
  if (!text || loading.value || !isConfigured.value) return;

  error.value = "";
  chatMessages.value.push({ role: "user", content: text });
  inputText.value = "";
  loading.value = true;

  try {
    const { onAgentChat } = await import("./agent.telefunc");
    const result = await onAgentChat(chatMessages.value, {
      apiUrl: agentConfig.apiUrl,
      apiKey: agentConfig.apiKey,
      model: agentConfig.model,
    });
    chatMessages.value.push({ role: "assistant", content: result.response });
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
};
</script>
