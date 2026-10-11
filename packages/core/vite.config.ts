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
    // marked / prismjs **打进产物**（不 external）：库交付 = 自足单文件，宿主不必再引脚本
    sourcemap: true,
  },
  plugins: [dts({ include: ["src"] })],
});
