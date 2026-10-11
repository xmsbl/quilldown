#!/usr/bin/env node
/**
 * edodo-write 原件入库（**产物随 git 走**，升级 = 改 `vendor/VERSION.json` 后重跑）。
 *
 *   node packages/wysiwyg/scripts/vendor.mjs
 *
 * 只取**原件**（standalone.js / edodo-write.css / LICENSE）：不打包、不做 i18n ——
 * 打包与 locale 施加归 `scripts/build.mjs`（同一份原件出多个 locale 变体）。
 * tarball 的 sha512 是 pin 死的：上游发了新 patch 也要先改清单，不会静默换原件。
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const manifest = JSON.parse(readFileSync(path.join(pkgRoot, "vendor/VERSION.json"), "utf8"));
const outDir = path.join(pkgRoot, "vendor/edodo");

const tmp = mkdtempSync(path.join(tmpdir(), "quilldown-vendor-"));
try {
  const tarball = path.join(tmp, "pkg.tgz");
  const url = `https://registry.npmjs.org/${manifest.name}/-/${manifest.name}-${manifest.version}.tgz`;
  process.stdout.write(`下载 ${manifest.name}@${manifest.version}\n`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`下载失败：HTTP ${response.status}（机器无外网？）`);
  writeFileSync(tarball, Buffer.from(await response.arrayBuffer()));

  const sha = createHash("sha512").update(readFileSync(tarball)).digest("hex");
  if (sha !== manifest.sha512) {
    throw new Error(`tarball 校验失败：期望 ${manifest.sha512}，实得 ${sha}`);
  }

  execFileSync("tar", ["-xzf", tarball, "-C", tmp, ...manifest.files]);
  mkdirSync(outDir, { recursive: true });
  for (const [from, to] of [
    ["package/dist-lib/standalone.js", "standalone.js"],
    ["package/dist-lib/edodo-write.css", "edodo-write.css"],
    ["package/LICENSE", "LICENSE"],
  ]) {
    const target = path.join(outDir, to);
    copyFileSync(path.join(tmp, from), target);
    if (to === "standalone.js") {
      // 原件尾巴指向它自己的 .map（没 vendored）→ 去掉，免得到处报「找不到源映射」
      writeFileSync(
        target,
        readFileSync(target, "utf8").replace(/^\/\/# sourceMappingURL=.*$/m, ""),
      );
    }
  }
  process.stdout.write(`入库：vendor/edodo（${manifest.name}@${manifest.version}）\n`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
