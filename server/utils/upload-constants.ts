import { join, resolve } from "node:path";

export const UPLOAD_DIR = resolve(
  process.cwd(),
  process.env.UPLOAD_DIR || join("data", "uploads"),
);

const parseFileSize = (
  value: string | undefined,
  defaultBytes: number,
): number => {
  if (!value) return defaultBytes;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultBytes;
};

// 50 MB default
export const MAX_FILE_SIZE = parseFileSize(
  process.env.MAX_FILE_SIZE,
  50 * 1024 * 1024,
);

export const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export const ALLOWED_EXTENSIONS = new Set(Object.keys(MIME_TYPES));
