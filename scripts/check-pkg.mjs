#!/usr/bin/env node
/**
 * 发布前的打包体检：`publint` + `attw`（are-the-types-wrong），逐包跑。
 *
 *   node scripts/check-pkg.mjs
 *
 * 两个工具都**只吃单个目录**（多目录时只认第一个）→ 这里逐包调用。
 *
 * 口径：
 * - `attw --profile esm-only`：三个包都是纯 ESM（`type: module` + 只有 `import` 条件），
 *   这是有意的取舍而不是缺陷（IIFE 消费者走 `unpkg` 产物，ESM 消费者本来就该用 `import`）。
 * - `--exclude-entrypoints ./index.css`：CSS 子路径没有 JS 语义，attw 对任何非 JS
 *   子路径都会报 `no-resolution` 假阳。
 * - **走的是 `--pack`（真 `npm pack` 后的 tarball）**，所以看到的就是发布出去的样子。
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const bin = (name) => path.join(root, "node_modules", ".bin", name);

const PACKAGES = ["core", "wysiwyg", "split"];

const TASKS = [
  {
    name: "publint",
    args: (dir) => [dir],
  },
  {
    name: "attw",
    args: (dir) => ["--pack", dir, "--profile", "esm-only", "--exclude-entrypoints", "./index.css"],
  },
];

let failed = 0;
for (const pkg of PACKAGES) {
  const dir = path.join("packages", pkg);
  for (const task of TASKS) {
    process.stdout.write(`\n=== ${task.name} ${dir}\n`);
    const res = spawnSync(bin(task.name), task.args(dir), { cwd: root, stdio: "inherit" });
    if (res.status !== 0) {
      failed++;
      process.stdout.write(`!! ${task.name} ${dir} 退出码 ${res.status}\n`);
    }
  }
}

if (failed > 0) {
  process.stdout.write(`\n${failed} 项未通过。\n`);
  process.exit(1);
}
process.stdout.write("\n打包体检全绿。\n");
