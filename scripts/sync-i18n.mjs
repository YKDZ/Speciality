#!/usr/bin/env node

/**
 * i18n Sync Script
 *
 * Scans the codebase for t() calls and synchronizes locale files.
 *
 * Usage:
 *   node scripts/sync-i18n.mjs          # Sync mode: update locale files
 *   node scripts/sync-i18n.mjs --check  # Check mode: report drift and exit non-zero
 *
 * Supports a magic comment to declare dynamic keys:
 *   // i18n-key: 食谱, 搭配, 控制面板
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, extname, resolve } from "node:path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ROOT_DIR = resolve(import.meta.dirname, "..");
const LOCALES_DIR = join(ROOT_DIR, "locales");
const SOURCE_LOCALE = "zh-CN";

/** Directories to scan (relative to ROOT_DIR) */
const SCAN_DIRS = ["components", "pages", "composables", "lib", "server"];

/** Extensions to scan */
const SCAN_EXTENSIONS = new Set([".vue", ".ts"]);

/** Directories to skip (relative to ROOT_DIR, prefix-matched) */
const IGNORE_PREFIXES = ["components/ui", "node_modules", "dist"];

// ---------------------------------------------------------------------------
// File collection
// ---------------------------------------------------------------------------

/** @param {string} dir @param {string} rootDir @returns {string[]} */
const collectFiles = (dir, rootDir) => {
  /** @type {string[]} */
  const files = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return files;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relPath = relative(rootDir, fullPath);
    if (IGNORE_PREFIXES.some((p) => relPath.startsWith(p))) continue;
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath, rootDir));
    } else if (SCAN_EXTENSIONS.has(extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
};

// ---------------------------------------------------------------------------
// Key extraction
// ---------------------------------------------------------------------------

/**
 * Extract i18n keys from t() string-literal calls.
 *
 * Handles:
 *   t("key")   t("key", { ... })
 *   t('key')   t('key', { ... })
 */
const T_STRING_RE =
  /\bt\(\s*(?:"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)')\s*[,)]/g;

/** Magic comment: // i18n-key: key1, key2, ... */
const I18N_KEY_COMMENT_RE = /\/\/\s*i18n-keys?:\s*(.+)/g;

/** Detect dynamic t(variable) calls for warnings */
const T_DYNAMIC_RE = /\bt\(\s*([a-zA-Z_$][a-zA-Z0-9_$.[\]]*)\s*[,)]/g;

/**
 * @param {string} rootDir
 * @returns {{ keys: Set<string>, warnings: { file: string, expression: string }[] }}
 */
const extractKeys = (rootDir) => {
  /** @type {Set<string>} */
  const keys = new Set();
  /** @type {Map<string, string>} key → relative file path (first occurrence) */
  const keySourceMap = new Map();
  /** @type {{ file: string, expression: string }[]} */
  const warnings = [];

  for (const scanDir of SCAN_DIRS) {
    const fullDir = join(rootDir, scanDir);
    const files = collectFiles(fullDir, rootDir);

    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      const relPath = relative(rootDir, file);

      // 1. Magic comments
      I18N_KEY_COMMENT_RE.lastIndex = 0;
      let cm;
      while ((cm = I18N_KEY_COMMENT_RE.exec(content)) !== null) {
        for (const k of cm[1].split(",")) {
          const trimmed = k.trim();
          if (trimmed) {
            keys.add(trimmed);
            if (!keySourceMap.has(trimmed)) keySourceMap.set(trimmed, relPath);
          }
        }
      }

      // 2. String-literal t() calls
      T_STRING_RE.lastIndex = 0;
      let sm;
      while ((sm = T_STRING_RE.exec(content)) !== null) {
        const key = sm[1] ?? sm[2];
        if (key) {
          keys.add(key);
          if (!keySourceMap.has(key)) keySourceMap.set(key, relPath);
        }
      }

      // 3. Dynamic t(variable) calls → warn
      //    Skip files that already declare their dynamic keys via i18n-key comments.
      const hasKeyComments = /\/\/\s*i18n-keys?:/.test(content);
      if (!hasKeyComments) {
        T_DYNAMIC_RE.lastIndex = 0;
        let dm;
        while ((dm = T_DYNAMIC_RE.exec(content)) !== null) {
          const expr = dm[1].trim();
          warnings.push({ file: relPath, expression: expr });
        }
      }
    }
  }

  return { keys, keySourceMap, warnings };
};

// ---------------------------------------------------------------------------
// Locale file operations
// ---------------------------------------------------------------------------

/** @param {string} filePath @returns {Record<string, string>} */
const readLocale = (filePath) => {
  if (!existsSync(filePath)) return {};
  return JSON.parse(readFileSync(filePath, "utf-8"));
};

/**
 * Sort keys by source file path, then by Chinese (pinyin) locale order within each file.
 * @param {Record<string, string>} obj
 * @param {Map<string, string>} [keySourceMap] key → source file path
 * @returns {Record<string, string>}
 */
const sortByKey = (obj, keySourceMap) => {
  const sorted = /** @type {Record<string, string>} */ ({});
  const keys = Object.keys(obj).sort((a, b) => {
    const sourceA = keySourceMap?.get(a) ?? "";
    const sourceB = keySourceMap?.get(b) ?? "";
    if (sourceA !== sourceB) return sourceA.localeCompare(sourceB);
    return a.localeCompare(b, "zh-CN");
  });
  for (const k of keys) sorted[k] = obj[k];
  return sorted;
};

/** @param {string} filePath @param {Record<string, string>} data */
const writeLocale = (filePath, data) => {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
};

// ---------------------------------------------------------------------------
// Diff computation
// ---------------------------------------------------------------------------

/**
 * @param {Set<string>} codeKeys
 * @param {Record<string, string>} localeData
 * @returns {{ added: string[], removed: string[] }}
 */
const computeDiff = (codeKeys, localeData) => {
  const localeKeys = new Set(Object.keys(localeData));
  const added = [...codeKeys].filter((k) => !localeKeys.has(k));
  const removed = [...localeKeys].filter((k) => !codeKeys.has(k));
  return { added, removed };
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const isCheck = process.argv.includes("--check");

console.log(`🔍 Scanning source files for i18n keys…\n`);

const { keys: codeKeys, keySourceMap, warnings } = extractKeys(ROOT_DIR);
console.log(`   Found ${codeKeys.size} unique key(s) in source code.\n`);

if (warnings.length > 0) {
  console.log(
    `⚠  Dynamic t() calls detected (consider adding // i18n-key comments):`,
  );
  for (const w of warnings) {
    console.log(`   ${w.file}: t(${w.expression})`);
  }
  console.log();
}

// Discover locale files
const localeFiles = readdirSync(LOCALES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => ({
    name: f.replace(/\.json$/, ""),
    path: join(LOCALES_DIR, f),
  }));

let hasChanges = false;

for (const locale of localeFiles) {
  const data = readLocale(locale.path);
  const { added, removed } = computeDiff(codeKeys, data);
  const isSource = locale.name === SOURCE_LOCALE;

  if (added.length === 0 && removed.length === 0) {
    // Still check if sorting changed
    const sorted = sortByKey(data, keySourceMap);
    const sortedJson = JSON.stringify(sorted, null, 2) + "\n";
    const currentJson = readFileSync(locale.path, "utf-8");
    if (sortedJson !== currentJson) {
      hasChanges = true;
      if (isCheck) {
        console.log(
          `❌ ${locale.name}.json: key order differs from expected sort order.`,
        );
      } else {
        writeLocale(locale.path, sorted);
        console.log(`✅ ${locale.name}.json: re-sorted keys.`);
      }
    } else {
      console.log(`✅ ${locale.name}.json: up to date.`);
    }
    continue;
  }

  hasChanges = true;

  if (isCheck) {
    console.log(`❌ ${locale.name}.json: out of sync`);
    if (added.length > 0) {
      console.log(`   Missing ${added.length} key(s):`);
      for (const k of added) console.log(`     + "${k}"`);
    }
    if (removed.length > 0) {
      console.log(`   Unused ${removed.length} key(s):`);
      for (const k of removed) console.log(`     - "${k}"`);
    }
  } else {
    // Apply changes
    const updated = { ...data };

    for (const k of removed) delete updated[k];
    for (const k of added) {
      // Source locale: key = value; other locales: empty string (needs translation)
      updated[k] = isSource ? k : "";
    }

    const sorted = sortByKey(updated, keySourceMap);
    writeLocale(locale.path, sorted);

    const parts = [];
    if (added.length > 0) parts.push(`+${added.length} added`);
    if (removed.length > 0) parts.push(`-${removed.length} removed`);
    console.log(`✅ ${locale.name}.json: updated (${parts.join(", ")}).`);
  }
}

console.log();

if (isCheck && hasChanges) {
  console.log(
    "❌ Locale files are out of sync. Run `node scripts/sync-i18n.mjs` to fix.\n",
  );
  process.exit(1);
} else if (isCheck) {
  console.log("✅ All locale files are in sync.\n");
} else {
  console.log("✅ Sync complete.\n");
}
