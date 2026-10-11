import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "Quilldown",
      formats: ["es", "iife"],
      fileName: (format) => (format === "es" ? "index.js" : "index.iife.js"),
    },
    sourcemap: true,
  },
  plugins: [dts({ include: ["src"] })],
});
