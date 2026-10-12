import { defineConfig } from "vite";
import { copyFileSync } from "node:fs";
import { isAbsolute } from "node:path";
import { fileURLToPath, URL } from "node:url";

/**
 * Library build. Bundles our own code into two ESM entries and externalises
 * every dependency (marked, turndown, react) so consumers resolve them via
 * their own package manager. `.d.ts` types are emitted separately by
 * `tsc -p tsconfig.lib.json`. The single stylesheet is emitted as
 * `dist-lib/edodo-write.css`. Output → dist-lib/.
 */
export default defineConfig({
  // Don't copy the site's public/ (llms.txt etc.) into the published package.
  publicDir: false,
  build: {
    outDir: "dist-lib",
    emptyOutDir: true,
    sourcemap: true,
    target: "es2022",
    minify: false,
    cssCodeSplit: false,
    lib: {
      entry: {
        index: fileURLToPath(new URL("./src/lib/index.ts", import.meta.url)),
        plugins: fileURLToPath(new URL("./src/plugins/index.ts", import.meta.url)),
        parse: fileURLToPath(new URL("./src/lib/parse-api.ts", import.meta.url)),
      },
      formats: ["es"],
    },
    rollupOptions: {
      // Externalise all bare (node_modules) imports; bundle only our own code.
      external: (id) => !id.startsWith(".") && !isAbsolute(id),
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: (asset) =>
          asset.names?.some((n) => n.endsWith(".css"))
            ? "edodo-write.css"
            : "assets/[name]-[hash][extname]",
      },
    },
  },
  plugins: [
    {
      // 宿主**前台**只需要「内容排版」那一份 → 单独拷一份（源仍是 src/content.css，一份源出两份）
      name: "edodo:content-css",
      closeBundle() {
        copyFileSync(
          fileURLToPath(new URL("./src/content.css", import.meta.url)),
          fileURLToPath(new URL("./dist-lib/edodo-content.css", import.meta.url)),
        );
      },
    },
  ],
});
