import { getContext } from "telefunc";

import type { ChatMessage } from "@/server/agent";

import { runAgent } from "@/server/agent";

export const onAgentChat = async (
  messages: ChatMessage[],
  config: { apiUrl: string; apiKey: string; model: string },
) => {
  const { db } = getContext<Vike.PageContextServer>();
  const response = await runAgent(db, config, messages);
  return { response };
};
