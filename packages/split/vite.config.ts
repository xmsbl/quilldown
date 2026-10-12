import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const require = createRequire(import.meta.url);
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
      external: ["@xmsbl/quilldown-core", "@xmsbl/quilldown-render"],
      output: {
        globals: {
          "@xmsbl/quilldown-core": "QuilldownCore",
          "@xmsbl/quilldown-render": "QuilldownRender",
        },
      },
    },
    sourcemap: true,
  },
  plugins: [
    dts({ include: ["src"] }),
    {
      // 样式单独一个入口（`@xmsbl/quilldown-split/index.css`）：入口**不** import CSS ——
      // 本包标了 `sideEffects: false`，自动 import 的 CSS 会被宿主的打包器整段摇掉。
      name: "quilldown:css",
      closeBundle() {
        // 预览正文排版与代码高亮（`.token`）来自管线包 —— 一份源，编辑面/前台共用
        const content = readFileSync(
          require.resolve("@xmsbl/quilldown-render/content.css"),
          "utf8",
        );
        writeFileSync(
          path.join(pkgRoot, "dist/index.css"),
          `${content}\n${readFileSync(path.join(pkgRoot, "src/styles.css"), "utf8")}`,
        );
      },
    },
  ],
});
