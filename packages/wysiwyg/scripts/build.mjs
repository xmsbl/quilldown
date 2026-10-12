#!/usr/bin/env node
/**
 * 构建 `@xmsbl/quilldown-wysiwyg`。
 *
 *   node packages/wysiwyg/scripts/build.mjs
 *
 * 两趟（口径与 core / split 一致）：
 *   ① `es`   —— `@xmsbl/quilldown-core` 与 `@xmsbl/quilldown-edodo` 都**外置**（声明为依赖），
 *                消费方的打包器负责去重 / 摇树；
 *   ② `iife` —— 只外置 core / 管线包（取全局 `QuilldownCore` / `QuilldownRender`），
 *                edodo 及其余依赖**打进产物**，让 `<script>` 直引也能自足。
 *
 * ⚠ `@xmsbl/quilldown-render` 在 IIFE 里也**必须外置**：它由 `core.iife.js` 等共用，
 *   打进来就会变成「同一页装两遍管线」。宿主按序引：`render` → `core` → `wysiwyg`。
 *
 * CSS：`dist/index.css` = edodo 编辑器皮肤（`@xmsbl/quilldown-edodo/styles.css`）+ 本包样式。
 *      **前台**只用 `@xmsbl/quilldown-edodo/content.css`（不含编辑 chrome）。
 *
 * 中文化走**运行时** `locale: "zh"`（`@xmsbl/quilldown-edodo` 的 `setLocale`）——
 * 不再有「一个 locale 一份产物」（旧机制：vendor 原件 + 构建期文本替换）。
 */
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "vite";
import dts from "vite-plugin-dts";

const require = createRequire(import.meta.url);
const pkgRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const dist = path.join(pkgRoot, "dist");

const CORE = "@xmsbl/quilldown-core";
const EDODO = "@xmsbl/quilldown-edodo";
const RENDER = "@xmsbl/quilldown-render";
/** 两个懒加载三方件（`import("katex")` 公式 / `import("edododraw")` 绘图）：留着外置。 */
const LAZY = ["katex", "edododraw"];

/** 一趟构建。 */
async function pass({ format, external, globals, withTypes }) {
  await build({
    configFile: false,
    root: pkgRoot,
    logLevel: "warn",
    // 产物里保留原文（不是 \uXXXX）：中文文案可直接 grep
    esbuild: { charset: "utf8" },
    plugins: withTypes ? [dts({ include: ["src"] })] : [],
    build: {
      lib: {
        entry: path.join(pkgRoot, "src/index.ts"),
        name: "QuilldownWysiwyg",
        formats: [format],
        fileName: () => (format === "es" ? "index.js" : "index.iife.js"),
      },
      rollupOptions: { external, output: { globals } },
      sourcemap: true,
      emptyOutDir: false,
    },
  });
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

await pass({
  format: "es",
  external: [CORE, EDODO, ...LAZY],
  globals: {},
  withTypes: true,
});

await pass({
  format: "iife",
  external: [CORE, RENDER, ...LAZY],
  globals: { [CORE]: "QuilldownCore", [RENDER]: "QuilldownRender" },
  withTypes: false,
});

// 样式：edodo 皮肤（`.ew-*`）+ 本包样式，拼成一份编辑器 CSS
writeFileSync(
  path.join(dist, "index.css"),
  `${readFileSync(require.resolve(`${EDODO}/styles.css`), "utf8")}\n${readFileSync(
    path.join(pkgRoot, "src/styles.css"),
    "utf8",
  )}`,
);
process.stdout.write("产物：dist/index.js · index.iife.js · index.css · index.d.ts\n");
