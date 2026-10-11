import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/*/test/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // edodo 原件有两个懒加载三方件（`import("katex")` 数学公式 / `import("edododraw")` 绘图）。
      // 测试环境拿桩顶掉，免得「没装」把整个测试文件挡在 import 阶段。
      katex: fileURLToPath(new URL("./packages/wysiwyg/test/stubs/katex.ts", import.meta.url)),
      edododraw: fileURLToPath(
        new URL("./packages/wysiwyg/test/stubs/edododraw.ts", import.meta.url),
      ),
    },
  },
});
