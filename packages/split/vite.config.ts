import { copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const pkgRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "QuilldownSplit",
      formats: ["es", "iife"],
      fileName: (format) => (format === "es" ? "index.js" : "index.iife.js"),
    },
    // core 外置（IIFE 取全局 `QuilldownCore`）：marked + Prism 已经在 core 产物里，
    // 两个包各打一份等于宿主页面里跑两套词法器
    rollupOptions: {
      external: ["@quilldown/core"],
      output: { globals: { "@quilldown/core": "QuilldownCore" } },
    },
    sourcemap: true,
  },
  plugins: [
    dts({ include: ["src"] }),
    {
      // 样式单独一个入口（`@quilldown/split/index.css`）：入口**不** import CSS ——
      // 本包标了 `sideEffects: false`，自动 import 的 CSS 会被宿主的打包器整段摇掉。
      name: "quilldown:css",
      closeBundle() {
        copyFileSync(path.join(pkgRoot, "src/styles.css"), path.join(pkgRoot, "dist/index.css"));
      },
    },
  ],
});
