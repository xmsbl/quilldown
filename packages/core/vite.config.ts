import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      // 与 wysiwyg / split 的 `Quilldown*` 命名一致（三个产物各自独立，不许互相覆盖全局）
      name: "QuilldownCore",
      formats: ["es", "iife"],
      fileName: (format) => (format === "es" ? "index.js" : "index.iife.js"),
    },
    // 管线（marked + Prism + sanitize + 锚点）在 `@xmsbl/quilldown-render`：
    // 外置 → 消费方共用一份；IIFE 取全局 `QuilldownRender`（宿主先引 `render.iife.js`）
    rollupOptions: {
      external: ["@xmsbl/quilldown-render"],
      output: { globals: { "@xmsbl/quilldown-render": "QuilldownRender" } },
    },
    sourcemap: true,
  },
  plugins: [dts({ include: ["src"] })],
});
