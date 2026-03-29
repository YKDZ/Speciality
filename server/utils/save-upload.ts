import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { v4 as uuidv4 } from "uuid";

import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  UPLOAD_DIR,
} from "./upload-constants";

export const saveUploadedFile = async (file: File): Promise<string> => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large");
  }

  const ext = extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error("File type not allowed");
  }

  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const filename = `${uuidv4()}${ext}`;
  const filepath = join(UPLOAD_DIR, filename);

  const arrayBuffer = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(arrayBuffer));

  return `/uploads/${filename}`;
};
