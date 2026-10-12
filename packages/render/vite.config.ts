import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "QuilldownRender",
      formats: ["es", "iife"],
      fileName: (format) => (format === "es" ? "index.js" : "index.iife.js"),
    },
    // marked / prismjs / htmlparser2 系列**打进产物**：交付 = 自足单文件，
    // 消费方（core / split / edodo）只管 `import` 这个包，各自产物保持轻量。
    sourcemap: true,
  },
  plugins: [dts({ include: ["src"] })],
});
