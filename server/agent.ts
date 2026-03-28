import { z } from "zod/v4";

import type { dbSqlite } from "@/database/drizzle/db";

import * as ingredientQueries from "@/database/drizzle/queries/ingredients";
import * as recipeQueries from "@/database/drizzle/queries/recipes";
import * as tagQueries from "@/database/drizzle/queries/tags";

type Db = ReturnType<typeof dbSqlite>;

// ── Agent Tools ──
// Tools the LLM agent can call to interact with the recipe database

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<
    string,
    { type: string; description: string; required?: boolean }
  >;
  execute: (db: Db, params: Record<string, string>) => Promise<string>;
}

const toolDefs: AgentTool[] = [
  {
    name: "search_recipes",
    description: "搜索食谱，根据名称或描述关键词查找",
    parameters: {
      query: { type: "string", description: "搜索关键词", required: true },
    },
    execute: async (db, params) => {
      const results = recipeQueries.searchRecipes(db, params.query);
      if (results.length === 0) return "未找到相关食谱。";
      return results
        .map(
          (r) =>
            `- **${r.name}**${r.description ? `: ${r.description}` : ""}（用时: ${r.estimatedTime ?? "未知"} 分钟）`,
        )
        .join("\n");
    },
  },
  {
    name: "get_recipe_detail",
    description: "获取食谱的详细信息，包括步骤和食材",
    parameters: {
      recipe_id: { type: "string", description: "食谱 ID", required: true },
    },
    execute: async (db, params) => {
      const recipe = recipeQueries.getRecipeById(db, params.recipe_id);
      if (!recipe) return "食谱不存在。";
      const steps = recipeQueries.getStepsByRecipeId(db, params.recipe_id);
      const ingredients = recipeQueries.getIngredientsByRecipeId(
        db,
        params.recipe_id,
      );
      const tags = recipeQueries.getTagsByRecipeId(db, params.recipe_id);

      let result = `# ${recipe.name}\n\n`;
      if (recipe.description) result += `${recipe.description}\n\n`;
      if (recipe.estimatedTime)
        result += `预计用时: ${recipe.estimatedTime} 分钟\n\n`;
      if (tags.length > 0)
        result += `标签: ${tags.map((t) => t.tagName).join(", ")}\n\n`;
      if (ingredients.length > 0) {
        result += `## 食材\n`;
        ingredients.forEach((i) => {
          result += `- ${i.ingredientName}${i.amount ? ` (${i.amount})` : ""}${i.note ? ` — ${i.note}` : ""}\n`;
        });
        result += "\n";
      }
      if (steps.length > 0) {
        result += `## 步骤\n`;
        steps.forEach((s, idx) => {
          result += `${idx + 1}. ${s.content}\n`;
        });
      }
      return result;
    },
  },
  {
    name: "list_all_recipes",
    description: "列出所有食谱的名称和简要信息",
    parameters: {},
    execute: async (db) => {
      const results = recipeQueries.getAllRecipes(db);
      if (results.length === 0) return "目前没有任何食谱。";
      return results
        .map(
          (r) =>
            `- **${r.name}** (ID: ${r.id})${r.description ? ` — ${r.description}` : ""}`,
        )
        .join("\n");
    },
  },
  {
    name: "list_ingredients",
    description: "列出所有食材",
    parameters: {},
    execute: async (db) => {
      const results = ingredientQueries.getAllIngredients(db);
      if (results.length === 0) return "目前没有任何食材。";
      return results
        .map(
          (i) =>
            `- **${i.name}**${i.description ? `: ${i.description}` : ""}${i.price ? ` (${i.price})` : ""}`,
        )
        .join("\n");
    },
  },
  {
    name: "list_tags",
    description: "列出所有标签",
    parameters: {},
    execute: async (db) => {
      const results = tagQueries.getAllTags(db);
      if (results.length === 0) return "目前没有任何标签。";
      return results.map((t) => t.name).join(", ");
    },
  },
  {
    name: "create_recipe",
    description: "创建新食谱",
    parameters: {
      name: { type: "string", description: "食谱名称", required: true },
      description: { type: "string", description: "食谱描述" },
      estimated_time: { type: "string", description: "预计用时（分钟）" },
    },
    execute: async (db, params) => {
      const recipe = recipeQueries.insertRecipe(db, {
        name: params.name,
        description: params.description,
        estimatedTime: params.estimated_time
          ? parseInt(params.estimated_time, 10)
          : undefined,
      });
      return `食谱 "${recipe.name}" 已创建 (ID: ${recipe.id})`;
    },
  },
  {
    name: "add_recipe_steps",
    description: "为食谱添加步骤",
    parameters: {
      recipe_id: { type: "string", description: "食谱 ID", required: true },
      steps: {
        type: "string",
        description: "步骤内容，用 ||| 分隔多个步骤",
        required: true,
      },
    },
    execute: async (db, params) => {
      const stepContents = params.steps
        .split("|||")
        .map((s) => s.trim())
        .filter(Boolean);
      const steps = stepContents.map((content, idx) => ({
        content,
        sortOrder: idx,
      }));
      recipeQueries.upsertSteps(db, params.recipe_id, steps);
      return `已为食谱添加 ${steps.length} 个步骤。`;
    },
  },
];

// ── Agent Core ──

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

const SYSTEM_PROMPT = `你是一个家庭食谱助手。你可以帮助用户查询食谱、创建食谱、修改食谱等。
你有以下工具可以使用：

${toolDefs.map((t) => `- ${t.name}: ${t.description}`).join("\n")}

当你需要使用工具时，请用以下格式输出：
<tool_call>
{"name": "tool_name", "params": {"param1": "value1"}}
</tool_call>

工具返回结果后，你应该基于结果回答用户的问题。
如果用户的问题不需要工具就能回答，直接回答即可。
请用中文回答。`;

const toolCallSchema = z.object({
  name: z.string(),
  params: z.record(z.string(), z.string()),
});

const parseToolCalls = (
  text: string,
): { name: string; params: Record<string, string> }[] => {
  const calls: { name: string; params: Record<string, string> }[] = [];
  const regex = /<tool_call>\s*(\{[\s\S]*?\})\s*<\/tool_call>/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    try {
      const raw: unknown = JSON.parse(match[1]);
      const result = toolCallSchema.safeParse(raw);
      if (result.success) {
        calls.push(result.data);
      }
    } catch {
      // skip invalid JSON
    }
  }
  return calls;
};

export const runAgent = async (
  db: Db,
  config: AgentConfig,
  messages: ChatMessage[],
): Promise<string> => {
  const fullMessages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ];

  // Agent loop (max 5 iterations for tool calls)
  for (let i = 0; i < 5; i += 1) {
    // oxlint-disable-next-line no-await-in-loop
    const response = await callLLM(config, fullMessages);
    const toolCalls = parseToolCalls(response);

    if (toolCalls.length === 0) {
      return response;
    }

    // Execute tool calls
    fullMessages.push({ role: "assistant", content: response });

    for (const call of toolCalls) {
      const tool = toolDefs.find((t) => t.name === call.name);
      if (tool) {
        // oxlint-disable-next-line no-await-in-loop
        const result = await tool.execute(db, call.params);
        fullMessages.push({
          role: "system",
          content: `工具 ${call.name} 返回结果:\n${result}`,
        });
      } else {
        fullMessages.push({
          role: "system",
          content: `工具 ${call.name} 不存在。`,
        });
      }
    }
  }

  return "抱歉，处理超时，请重新提问。";
};

const callLLM = async (
  config: AgentConfig,
  messages: ChatMessage[],
): Promise<string> => {
  const response = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM API error: ${response.status} ${text}`);
  }

  const json: unknown = await response.json();
  const llmResult = z
    .object({
      choices: z.array(
        z.object({ message: z.object({ content: z.string() }) }),
      ),
    })
    .safeParse(json);
  if (!llmResult.success) {
    throw new Error("Unexpected LLM API response format");
  }
  return llmResult.data.choices[0]?.message?.content ?? "";
};

export const getToolDefinitions = () =>
  toolDefs.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));
