import { defineConfig } from "vite";

export default defineConfig({
  // 两页并排：index.html = wysiwyg，split.html = 分屏。**同一份宿主契约**，只换库
  build: { outDir: "dist", rollupOptions: { input: { index: "index.html", split: "split.html" } } },
});
