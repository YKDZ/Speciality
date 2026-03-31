// ── 类型定义 ──

export interface RecipeMdData {
  name: string;
  description?: string;
  coverImage?: string;
  tags?: string[];
  estimatedTime?: number;
  ingredients: RecipeMdIngredient[];
  steps: RecipeMdStep[];
}

export interface RecipeMdIngredient {
  name: string;
  quantity?: string;
  unit?: string;
  note?: string;
}

export interface RecipeMdStep {
  sortOrder: number;
  name?: string;
  content: string;
}

// ── 序列化：结构化数据 → MD 字符串 ──

export const serializeRecipe = (recipe: RecipeMdData): string => {
  const lines: string[] = [];

  // YAML Front Matter - 始终输出
  lines.push("---");
  lines.push(`name: ${recipe.name}`);
  if (recipe.tags && recipe.tags.length > 0) {
    lines.push("tags:");
    for (const tag of recipe.tags) {
      lines.push(`  - ${tag}`);
    }
  }
  if (recipe.estimatedTime !== undefined) {
    lines.push(`time: ${recipe.estimatedTime}`);
  }
  lines.push("---", "");

  // 封面图（可选）- FM 之后第一个元素
  if (recipe.coverImage) {
    lines.push(`![cover](${recipe.coverImage})`, "");
  }

  // 描述（可选）
  if (recipe.description) {
    lines.push(recipe.description, "");
  }

  // 食材 - `---` 分隔符 + 无序列表
  lines.push("---", "");
  for (const ing of recipe.ingredients) {
    const qty =
      ing.quantity || ing.unit
        ? `${ing.quantity ?? ""}${ing.unit ? ` ${ing.unit}` : ""}`
        : "";
    const noteStr = ing.note ? ` [${ing.note}]` : "";
    lines.push(`- ${ing.name}: ${qty}${noteStr}`);
  }
  lines.push("");

  // 步骤 - `---` 分隔符 + 有序列表
  lines.push("---", "");
  for (const step of recipe.steps) {
    const marker = `${step.sortOrder + 1}. `;
    const indent = " ".repeat(marker.length);

    if (step.name) {
      // 有名称：名称在标记行，空行后缩进内容
      lines.push(`${marker}${step.name}`);
      if (step.content) {
        lines.push("");
        const contentLines = step.content.split("\n");
        for (const cl of contentLines) {
          lines.push(cl ? `${indent}${cl}` : "");
        }
      }
    } else {
      // 无名称：内容直接跟在标记后
      const contentLines = (step.content ?? "").split("\n");
      lines.push(`${marker}${contentLines[0] ?? ""}`);
      for (let i = 1; i < contentLines.length; i += 1) {
        const cl = contentLines[i];
        lines.push(cl ? `${indent}${cl}` : "");
      }
    }

    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
};

// ── 反序列化：MD 字符串 → 结构化数据（基于 remark AST） ──

import type { Heading, RootContent } from "mdast";

import { toString } from "mdast-util-to-string";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { parse as parseYaml } from "yaml";

// 解析食材行的数量和单位
const parseQuantityUnit = (
  raw: string,
): { quantity?: string; unit?: string } => {
  const trimmed = raw.trim();
  if (!trimmed) return {};

  // 尝试匹配: 阿拉伯数字(含小数) + 可选空格 + 单位
  const numericMatch = trimmed.match(/^(\d+\.?\d*)\s*(.*)$/);
  if (numericMatch) {
    const quantity = numericMatch[1];
    const unit = numericMatch[2].trim() || undefined;
    return { quantity, unit };
  }

  // 包含空格 → 以首个空格分割
  const spaceIdx = trimmed.indexOf(" ");
  if (spaceIdx !== -1) {
    return {
      quantity: trimmed.slice(0, spaceIdx),
      unit: trimmed.slice(spaceIdx + 1).trim() || undefined,
    };
  }

  // 纯文本（如 "五斤"、"少许"）→ 整体作为 quantity
  return { quantity: trimmed };
};

// 从列表项的文本内容解析食材
const parseIngredientText = (text: string): RecipeMdIngredient | undefined => {
  const content = text.trim();
  if (!content) return undefined;

  // 兼容半角 `:` 和全角 `：`
  const colonIdx = content.search(/[:：]/);
  if (colonIdx === -1) {
    return { name: content };
  }

  const name = content.slice(0, colonIdx).trim();
  const rest = content.slice(colonIdx + 1).trim();

  // 提取备注 [...]
  let note: string | undefined;
  let amountPart = rest;
  const noteMatch = rest.match(/\[([^\]]*)\]\s*$/);
  if (noteMatch) {
    note = noteMatch[1];
    amountPart = rest.slice(0, noteMatch.index).trim();
  }

  const { quantity, unit } = parseQuantityUnit(amountPart);

  return { name, quantity, unit, note };
};

// AST 辅助：判断节点是否为指定 depth 的 heading
const isHeading = (node: RootContent, depth: number): node is Heading =>
  node.type === "heading" && node.depth === depth;

// AST 辅助：从 paragraph 中提取唯一的 image url（如果非图片段落则返回 undefined）
const extractSoloImageUrl = (node: RootContent): string | undefined => {
  if (
    node.type === "paragraph" &&
    node.children.length === 1 &&
    node.children[0].type === "image"
  ) {
    return node.children[0].url;
  }
  return undefined;
};

// 使用源码位置从原始 MD 中切取文本
const sliceSource = (md: string, node: RootContent): string =>
  md.slice(node.position!.start.offset, node.position!.end.offset);

// AST 辅助：thematicBreak 检测
const isThematicBreak = (node: RootContent): boolean =>
  node.type === "thematicBreak";

// 智能检测：thematicBreak 后紧跟无序列表 → 食材分隔符
const isIngredientSeparator = (nodes: RootContent[], idx: number): boolean => {
  const next = nodes[idx + 1];
  return next?.type === "list" && !next.ordered;
};

// 智能检测：thematicBreak 后紧跟有序列表 → 步骤分隔符
const isStepSeparator = (nodes: RootContent[], idx: number): boolean => {
  const next = nodes[idx + 1];
  return next?.type === "list" && !!next.ordered;
};

// 反缩进：去除有序列表项内容的列表缩进
const deindentContent = (
  md: string,
  nodes: RootContent[],
  indentCols: number,
): string => {
  if (nodes.length === 0) return "";

  const start = nodes[0].position!.start.offset!;
  const end = nodes[nodes.length - 1].position!.end.offset!;
  const raw = md.slice(start, end);
  const indentStr = " ".repeat(indentCols);

  return raw
    .split("\n")
    .map((line) => (line.startsWith(indentStr) ? line.slice(indentCols) : line))
    .join("\n")
    .trim();
};

const parser = unified().use(remarkParse).use(remarkFrontmatter);

export const parseRecipe = (md: string): RecipeMdData => {
  const tree = parser.parse(md);
  const nodes = tree.children;
  let cursor = 0;

  // 0. 提取 YAML Front Matter（如果存在）
  let name = "";
  let coverImage: string | undefined;
  let tags: string[] | undefined;
  let estimatedTime: number | undefined;

  if (cursor < nodes.length && nodes[cursor].type === "yaml") {
    const yamlNode = nodes[cursor];
    const yamlValue =
      "value" in yamlNode && typeof yamlNode.value === "string"
        ? yamlNode.value
        : "";
    const isRecord = (v: unknown): v is Record<string, unknown> =>
      typeof v === "object" && v !== null && !Array.isArray(v);
    const fmRaw: unknown = parseYaml(yamlValue);
    const fm = isRecord(fmRaw) ? fmRaw : null;
    if (fm && typeof fm === "object") {
      if (typeof fm.name === "string") name = fm.name;
      if (Array.isArray(fm.tags)) {
        tags = fm.tags.filter((t): t is string => typeof t === "string");
        if (tags.length === 0) tags = undefined;
      }
      if (
        typeof fm.time === "number" &&
        Number.isFinite(fm.time) &&
        fm.time > 0
      ) {
        estimatedTime = fm.time;
      }
    }
    cursor += 1;
  }

  // 1. 兼容：如果 FM 中没有 name，从正文 h1 提取
  if (!name && cursor < nodes.length && isHeading(nodes[cursor], 1)) {
    name = toString(nodes[cursor]);
    cursor += 1;
  }

  // 2. 封面图检测：FM/h1 之后首个独图段落
  if (cursor < nodes.length) {
    const imgUrl = extractSoloImageUrl(nodes[cursor]);
    if (imgUrl) {
      coverImage = imgUrl;
      cursor += 1;
    }
  }

  // 3. 描述--直到遇到有效食材分隔符（thematicBreak + 无序列表）
  const descParts: string[] = [];
  while (cursor < nodes.length) {
    const node = nodes[cursor];
    if (isThematicBreak(node) && isIngredientSeparator(nodes, cursor)) break;
    descParts.push(sliceSource(md, node));
    cursor += 1;
  }
  const description = descParts.join("\n\n").trim() || undefined;

  // 4. 跳过食材分隔符，解析无序列表
  const ingredients: RecipeMdIngredient[] = [];
  if (cursor < nodes.length && isThematicBreak(nodes[cursor])) {
    cursor += 1; // 跳过 thematicBreak
    while (cursor < nodes.length) {
      const node = nodes[cursor];
      if (isThematicBreak(node) && isStepSeparator(nodes, cursor)) break;
      if (node.type === "list" && !node.ordered) {
        for (const item of node.children) {
          const text = toString(item);
          const ing = parseIngredientText(text);
          if (ing) ingredients.push(ing);
        }
      }
      cursor += 1;
    }
  }

  // 5. 跳过步骤分隔符，解析有序列表
  const steps: RecipeMdStep[] = [];
  if (cursor < nodes.length && isThematicBreak(nodes[cursor])) {
    cursor += 1; // 跳过 thematicBreak

    while (cursor < nodes.length) {
      const node = nodes[cursor];
      if (node.type === "list" && node.ordered) {
        for (const item of node.children) {
          if (item.children.length > 1) {
            // Multiple children: first paragraph = name, rest = content
            const nameNode = item.children[0];
            const stepName = nameNode
              ? toString(nameNode).trim() || undefined
              : undefined;

            const contentChildren = item.children.slice(1) as RootContent[];
            const indentCols = nameNode
              ? nameNode.position!.start.column - 1
              : 4;
            const content = deindentContent(md, contentChildren, indentCols);

            steps.push({
              sortOrder: steps.length,
              name: stepName,
              content,
            });
          } else {
            // Single child: no name, the only child is content
            const contentChildren = item.children as RootContent[];
            const indentCols = contentChildren[0]
              ? contentChildren[0].position!.start.column - 1
              : 4;
            const content = deindentContent(md, contentChildren, indentCols);

            steps.push({
              sortOrder: steps.length,
              name: undefined,
              content,
            });
          }
        }
      }
      cursor += 1;
    }
  }

  return {
    name,
    description,
    coverImage,
    tags,
    estimatedTime,
    ingredients,
    steps,
  };
};
