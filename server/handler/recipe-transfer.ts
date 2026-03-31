import { eq } from "drizzle-orm";
import { zipSync, unzipSync, strToU8, strFromU8 } from "fflate";
import { Hono } from "hono";
import { readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { getGlobalContext } from "vike/server";

import type { RecipeMdData } from "@/lib/recipe-md";

import { insertIngredient } from "@/database/drizzle/queries/ingredients";
import {
  getIngredientsByRecipeId,
  getRecipeById,
  getStepsByRecipeId,
  getTagsByRecipeId,
  insertRecipe,
  upsertRecipeIngredients,
  upsertRecipeTags,
  upsertSteps,
} from "@/database/drizzle/queries/recipes";
import { insertTag } from "@/database/drizzle/queries/tags";
import { ingredientsTable } from "@/database/drizzle/schema/ingredients";
import { tagsTable } from "@/database/drizzle/schema/tags";
import { parseRecipe, serializeRecipe } from "@/lib/recipe-md";
import { saveUploadedFile } from "@/server/utils/save-upload";
import { UPLOAD_DIR } from "@/server/utils/upload-constants";

const app = new Hono();

const getDb = async () => {
  const globalContext = await getGlobalContext();
  if (globalContext.isClientSide) throw new Error("Server-only handler");
  return globalContext.db;
};

// Regex to extract image refs from markdown: ![alt](url)
const IMAGE_REF_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

// 判断是否为本地路径（非外部 URL）
const isLocalImagePath = (url: string): boolean =>
  url.startsWith("/") && !url.startsWith("//");

// 根据 URL 路径解析实际文件系统路径
const resolveLocalImagePath = (urlPath: string): string => {
  if (urlPath.startsWith("/uploads/")) {
    const filename = urlPath.split("/").pop()!;
    return join(UPLOAD_DIR, filename);
  }
  // /seed-images/xxx.jpg → public/seed-images/xxx.jpg
  return join(process.cwd(), "public", urlPath);
};

// Collect local image paths from markdown content
const collectLocalImages = (md: string): string[] => {
  const results: string[] = [];
  let match;
  const re = new RegExp(IMAGE_REF_RE.source, "g");
  while ((match = re.exec(md)) !== null) {
    const url = match[2];
    if (isLocalImagePath(url)) {
      results.push(url);
    }
  }
  return results;
};

// Rewrite local image paths in markdown: /uploads/xxx.jpg → images/xxx.jpg
const rewriteLocalImages = (md: string): string =>
  md.replace(IMAGE_REF_RE, (_full, alt: string, url: string) => {
    if (isLocalImagePath(url)) {
      const filename = url.split("/").pop()!;
      return `![${alt}](images/${filename})`;
    }
    return `![${alt}](${url})`;
  });

// Build RecipeMdData from database recipe
const buildRecipeMdData = async (
  recipeId: string,
): Promise<RecipeMdData | undefined> => {
  const db = await getDb();
  const recipe = getRecipeById(db, recipeId);
  if (!recipe) return undefined;

  const steps = getStepsByRecipeId(db, recipeId);
  const ingredients = getIngredientsByRecipeId(db, recipeId);
  const tags = getTagsByRecipeId(db, recipeId);

  return {
    name: recipe.name,
    description: recipe.description ?? undefined,
    coverImage: recipe.coverImage ?? undefined,
    tags: tags.length > 0 ? tags.map((t) => t.tagName) : undefined,
    estimatedTime: recipe.estimatedTime ?? undefined,
    ingredients: ingredients.map((ing) => ({
      name: ing.ingredientName,
      quantity: ing.quantity ?? undefined,
      unit: ing.unit ?? undefined,
      note: ing.note ?? undefined,
    })),
    steps: steps.map((s) => ({
      sortOrder: s.sortOrder,
      name: s.name ?? undefined,
      content: s.content,
    })),
  };
};

// Package a single recipe into zip file entries
const packageRecipe = (
  data: RecipeMdData,
  prefix: string,
): Record<string, Uint8Array> => {
  const entries: Record<string, Uint8Array> = {};

  // Rewrite images in the data before serialization
  const rewrittenCover =
    data.coverImage && isLocalImagePath(data.coverImage)
      ? `images/${data.coverImage.split("/").pop()!}`
      : data.coverImage;

  const rewritten: RecipeMdData = {
    ...data,
    coverImage: rewrittenCover,
    description: data.description
      ? rewriteLocalImages(data.description)
      : undefined,
    steps: data.steps.map((s) => ({
      ...s,
      content: rewriteLocalImages(s.content),
    })),
  };

  const md = serializeRecipe(rewritten);
  entries[`${prefix}${data.name}.md`] = strToU8(md);

  // Collect all local images
  const localImages = new Set<string>();
  if (data.coverImage && isLocalImagePath(data.coverImage)) {
    localImages.add(data.coverImage);
  }
  if (data.description) {
    for (const img of collectLocalImages(data.description)) {
      localImages.add(img);
    }
  }
  for (const step of data.steps) {
    for (const img of collectLocalImages(step.content)) {
      localImages.add(img);
    }
  }

  // Read and pack image files
  for (const imgPath of localImages) {
    const filename = imgPath.split("/").pop()!;
    const filepath = resolveLocalImagePath(imgPath);
    try {
      const buf = readFileSync(filepath);
      entries[`${prefix}images/${filename}`] = new Uint8Array(buf);
    } catch {
      // Skip missing files
    }
  }

  return entries;
};

// ── GET /:id/export - 单个食谱导出 ──
app.get("/:id/export", async (c) => {
  const id = c.req.param("id");
  const data = await buildRecipeMdData(id);
  if (!data) return c.text("Recipe not found", 404);

  const entries = packageRecipe(data, "");
  const entryKeys = Object.keys(entries);
  const hasImages = entryKeys.some((k) => k.startsWith("images/"));

  if (!hasImages) {
    const mdKey = entryKeys.find((k) => k.endsWith(".md"));
    if (mdKey) {
      return new Response(Buffer.from(entries[mdKey]), {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(data.name)}.md"`,
        },
      });
    }
  }

  const zipped = zipSync(entries);
  return new Response(Buffer.from(zipped), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(data.name)}.zip"`,
    },
  });
});

// ── POST /export-batch - 批量食谱导出 ──
app.post("/export-batch", async (c) => {
  const body = await c.req.json<{ ids: string[] }>();
  const ids = body.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return c.text("No recipe IDs provided", 400);
  }

  if (ids.length === 1) {
    // Single recipe - same as single export
    const data = await buildRecipeMdData(ids[0]);
    if (!data) return c.text("Recipe not found", 404);

    const entries = packageRecipe(data, "");
    const zipped = zipSync(entries);

    return new Response(Buffer.from(zipped), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(data.name)}.zip"`,
      },
    });
  }

  // Multiple recipes - each in subdirectory
  const allEntries: Record<string, Uint8Array> = {};
  for (const id of ids) {
    // oxlint-disable-next-line no-await-in-loop
    const data = await buildRecipeMdData(id);
    if (!data) continue;
    const prefix = `${data.name}/`;
    const entries = packageRecipe(data, prefix);
    Object.assign(allEntries, entries);
  }

  if (Object.keys(allEntries).length === 0) {
    return c.text("No recipes found", 404);
  }

  const zipped = zipSync(allEntries);
  return new Response(Buffer.from(zipped), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="recipes-export.zip"',
    },
  });
});

// ── POST /import - 食谱导入 ──
app.post("/import", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return c.json({ error: "No file provided" }, 400);
  }

  let mdContent: string;
  let zipImages: Map<string, Uint8Array> = new Map();
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".zip")) {
    // Extract zip
    const arrayBuffer = await file.arrayBuffer();
    const unzipped = unzipSync(new Uint8Array(arrayBuffer));

    // Find .md file (root or subdirectory)
    let mdFile: string | undefined;
    for (const path of Object.keys(unzipped)) {
      if (path.endsWith(".md")) {
        mdFile = path;
        break;
      }
    }
    if (!mdFile) {
      return c.json({ error: "No .md file found in zip" }, 400);
    }

    mdContent = strFromU8(unzipped[mdFile]);

    // Collect images from zip
    for (const [path, data] of Object.entries(unzipped)) {
      if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(path)) {
        // Normalize: strip leading directory to get relative name
        const parts = path.split("/");
        const imgName = parts[parts.length - 1];
        zipImages.set(imgName, data);
      }
    }
  } else if (fileName.endsWith(".md")) {
    mdContent = await file.text();
  } else {
    return c.json({ error: "Unsupported file type" }, 400);
  }

  // Parse markdown
  const parsed = parseRecipe(mdContent);

  const db = await getDb();

  // Save images from zip and rewrite paths
  const imagePathMap = new Map<string, string>(); // old filename → new /uploads/... path

  const saveImageFromZip = async (filename: string): Promise<string> => {
    const cached = imagePathMap.get(filename);
    if (cached) return cached;

    const imageData = zipImages.get(filename);
    if (!imageData) return `images/${filename}`; // keep original if not in zip

    const ext = extname(filename).toLowerCase();
    const blob = new File([Buffer.from(imageData)], `upload${ext}`, {
      type: `image/${ext.slice(1)}`,
    });
    const uploadUrl = await saveUploadedFile(blob);
    imagePathMap.set(filename, uploadUrl);
    return uploadUrl;
  };

  // Rewrite cover image
  if (parsed.coverImage?.startsWith("images/")) {
    const filename = parsed.coverImage.split("/").pop()!;
    parsed.coverImage = await saveImageFromZip(filename);
  }

  // Rewrite step content images
  for (const step of parsed.steps) {
    const imgRefs: { full: string; filename: string }[] = [];
    let match;
    const re = new RegExp(IMAGE_REF_RE.source, "g");
    while ((match = re.exec(step.content)) !== null) {
      const url = match[2];
      if (url.startsWith("images/")) {
        imgRefs.push({ full: match[0], filename: url.split("/").pop()! });
      }
    }
    for (const ref of imgRefs) {
      // oxlint-disable-next-line no-await-in-loop
      const newUrl = await saveImageFromZip(ref.filename);
      step.content = step.content.replace(
        ref.full,
        ref.full.replace(`images/${ref.filename}`, newUrl),
      );
    }
  }

  // Match/create ingredients
  const ingredientItems: {
    ingredientId: string;
    quantity?: string;
    unit?: string;
    note?: string;
  }[] = [];

  for (const ing of parsed.ingredients) {
    // Search by exact name
    const existing = db
      .select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.name, ing.name))
      .get();

    let ingredientId: string;
    if (existing) {
      ingredientId = existing.id;
    } else {
      const created = insertIngredient(db, { name: ing.name });
      ingredientId = created.id;
    }

    ingredientItems.push({
      ingredientId,
      quantity: ing.quantity,
      unit: ing.unit,
      note: ing.note,
    });
  }

  // Match/create tags
  const tagIds: string[] = [];
  if (parsed.tags && parsed.tags.length > 0) {
    for (const tagName of parsed.tags) {
      const existing = db
        .select()
        .from(tagsTable)
        .where(eq(tagsTable.name, tagName))
        .get();

      if (existing) {
        tagIds.push(existing.id);
      } else {
        const created = insertTag(db, tagName);
        tagIds.push(created.id);
      }
    }
  }

  // Create recipe
  const recipe = insertRecipe(db, {
    name: parsed.name,
    description: parsed.description,
    coverImage: parsed.coverImage,
    estimatedTime: parsed.estimatedTime,
  });

  // Create steps
  upsertSteps(
    db,
    recipe.id,
    parsed.steps.map((s) => ({
      content: s.content,
      sortOrder: s.sortOrder,
      name: s.name,
    })),
  );

  // Create ingredient associations
  upsertRecipeIngredients(db, recipe.id, ingredientItems);

  // Create tag associations
  if (tagIds.length > 0) {
    upsertRecipeTags(db, recipe.id, tagIds);
  }

  return c.json({ recipeId: recipe.id });
});

export default app;
