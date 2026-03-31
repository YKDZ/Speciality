import { Hono } from "hono";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { Readable } from "node:stream";

import { MIME_TYPES, UPLOAD_DIR } from "@/server/utils/upload-constants";

const app = new Hono();

// 静态文件服务 - 将 data/uploads/ 映射到 /uploads/*
app.get("/:filename", async (c) => {
  const filename = c.req.param("filename");
  // 防止路径遍历攻击
  if (
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return c.text("Forbidden", 403);
  }
  const filepath = join(UPLOAD_DIR, filename);
  if (!existsSync(filepath)) {
    return c.text("Not Found", 404);
  }
  const stat = statSync(filepath);
  const ext = extname(filename).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  const stream = createReadStream(filepath);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": stat.size.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
});

export default app;
