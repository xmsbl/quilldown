#!/usr/bin/env node
/**
 * 构建 `@xmsbl/quilldown-render`。两趟（与 `wysiwyg` 同口径）：
 *
 *   ① `es`   —— 运行时依赖**外置**：上层（core / split / edodo）本来就 external 本包，
 *                最终由消费者的打包器去重 + 摇树（ESM 产物因此只有几 kB）；
 *   ② `iife` —— 依赖打进产物，`<script>` 直引自足。
 *
 * 注：本仓 root 槽位被 dev-only 的 `jsdom → parse5 → entities@8` 占着，磁盘上
 * `entities@4.5.0` 确实有两份（`htmlparser2/` 与 `dom-serializer/` 各一），但 Vite
 * 解析出的 IIFE 与「只装一份」等价（验证过构建期 `resolve.alias` 方案，反而更大，
 * 已舍弃）—— 不要重复这个尝试。
 */
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "vite";
import dts from "vite-plugin-dts";

const pkgRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const dist = path.join(pkgRoot, "dist");
const entry = path.join(pkgRoot, "src/index.ts");

/** 运行时依赖：ES 外置、IIFE 打包。 */
const DEPENDENCIES = ["marked", "prismjs", "htmlparser2", "dom-serializer", "domhandler"];

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const shared = {
  configFile: false,
  root: pkgRoot,
  logLevel: "warn",
  // 产物里保留原文（不是 \uXXXX），中文可直接 grep，体积也更小
  esbuild: { charset: "utf8" },
  build: {
    lib: { entry, name: "QuilldownRender" },
    sourcemap: true,
    emptyOutDir: false,
  },
};

await build({
  ...shared,
  plugins: [dts({ include: ["src"] })],
  build: {
    ...shared.build,
    lib: { ...shared.build.lib, formats: ["es"], fileName: () => "index.js" },
    rollupOptions: {
      external: (id) => DEPENDENCIES.some((dep) => id === dep || id.startsWith(`${dep}/`)),
    },
  },
});

await build({
  ...shared,
  build: {
    ...shared.build,
    lib: { ...shared.build.lib, formats: ["iife"], fileName: () => "index.iife.js" },
  },
});

// 内容排版（宿主前台唯一需要的 CSS）单独出一个文件：源是 src/content.css
copyFileSync(path.join(pkgRoot, "src/content.css"), path.join(dist, "content.css"));

process.stdout.write("产物：dist/index.js（依赖外置）· index.iife.js（自足）· content.css\n");
