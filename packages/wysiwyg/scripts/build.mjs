#!/usr/bin/env node
/**
 * 构建 `@quilldown/wysiwyg`。
 *
 *   node packages/wysiwyg/scripts/build.mjs
 *
 * 一次运行产出**两个 locale 变体**（edodo 的界面文案只能构建期烤 —— 上游没有 i18n 接口）：
 *   dist/index.js · dist/index.iife.js          ← 默认 en（原件本来就是英文）
 *   dist/index.zh.js · dist/index.iife.zh.js    ← zh（`locales/zh.tsv`）
 * 另有 dist/index.css（edodo 本体 + 本包样式）与 dist/index.d.ts（类型）。
 *
 * ⚠ locale 的施加点是**读取** vendored 原件的瞬间（vite plugin 的 `load`）：
 *   磁盘上那份 `vendor/edodo/standalone.js` 永远保持原件，多个变体互不污染。
 * ⚠ `@quilldown/core` 外置（IIFE 取全局 `QuilldownCore`）：两个包各发一份产物，
 *   免得 marked + Prism 被打进来两遍。
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "vite";
import dts from "vite-plugin-dts";

import { applyPairs, loadPairs } from "./i18n.mjs";

const pkgRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const vendorEntry = path.join(pkgRoot, "vendor/edodo/standalone.js");
const vendorCss = path.join(pkgRoot, "vendor/edodo/edodo-write.css");
const dist = path.join(pkgRoot, "dist");

const LOCALES = [
  { id: "en", tsv: null, suffix: "" },
  { id: "zh", tsv: path.join(pkgRoot, "locales/zh.tsv"), suffix: ".zh" },
];

/** 把某个 locale 的清单施加到 vendored 原件上（只在 vite 读那一份文件时发生）。 */
function i18nPlugin(locale) {
  const pairs = locale.tsv ? loadPairs(locale.tsv) : null;
  return {
    name: "quilldown:i18n",
    enforce: "pre",
    load(id) {
      if (!pairs || path.resolve(id) !== vendorEntry) return null;
      const source = readFileSync(vendorEntry, "utf8");
      const stats = {};
      const code = applyPairs(source, pairs, path.relative(pkgRoot, locale.tsv), stats);
      process.stdout.write(
        `  i18n[${locale.id}]：${stats.hits}/${pairs.length} 条命中，${stats.replaced} 处替换\n`,
      );
      return code;
    },
  };
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const locale of LOCALES) {
  await build({
    configFile: false,
    root: pkgRoot,
    logLevel: "warn",
    // 产物里保留原文（不是 \uXXXX）：locale 变体可以直接 grep 中文，体积也更小
    esbuild: { charset: "utf8" },
    plugins: [
      i18nPlugin(locale),
      // 类型与 locale 无关，只第一次跑
      ...(locale.suffix === "" ? [dts({ include: ["src"] })] : []),
    ],
    build: {
      lib: {
        entry: path.join(pkgRoot, "src/index.ts"),
        name: "QuilldownWysiwyg",
        formats: ["es", "iife"],
        fileName: (format) =>
          format === "es" ? `index${locale.suffix}.js` : `index.iife${locale.suffix}.js`,
      },
      rollupOptions: {
        external: ["@quilldown/core", "edododraw", "katex"],
        output: { globals: { "@quilldown/core": "QuilldownCore" } },
      },
      sourcemap: true,
      emptyOutDir: false,
    },
  });
}

writeFileSync(
  path.join(dist, "index.css"),
  `${readFileSync(vendorCss, "utf8")}\n${readFileSync(path.join(pkgRoot, "src/styles.css"), "utf8")}`,
);
process.stdout.write("产物：dist/index[.zh].js · index[.zh].iife.js · index.css · index.d.ts\n");
