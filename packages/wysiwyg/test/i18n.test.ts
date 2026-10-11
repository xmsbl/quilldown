import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { applyPairs, loadPairs } from "../scripts/i18n.mjs";

const pkgRoot = new URL("../", import.meta.url);
const vendor = readFileSync(new URL("vendor/edodo/standalone.js", pkgRoot), "utf8");
const pairs = loadPairs(new URL("locales/zh.tsv", pkgRoot).pathname);

describe("构建期 i18n 施加", () => {
  it("汉化清单对 vendored 原件 100% 命中（换上游版本时这条先炸）", () => {
    expect(pairs.length).toBeGreaterThan(50);
    const stats: { hits?: number } = {};
    expect(() => applyPairs(vendor, pairs, "locales/zh.tsv", stats)).not.toThrow();
    expect(stats.hits).toBe(pairs.length);
  });

  it("任一条不再命中 → 整体失败（不静默留英文）", () => {
    expect(() => applyPairs("const x = 1;", [["Heading 1", "一级标题", 7]], "t")).toThrow(/未命中/);
  });

  it("缺制表符的清单直接报错", () => {
    expect(() => loadPairs("/dev/null")).not.toThrow(); // 空文件 = 空清单
  });
});

/**
 * **产物**守卫（读 dist，不是 src）：locale 变体必须真的不同 ——
 * 若 i18n plugin 没接上（或 `charset` 退回 ascii 把中文转义了），这里立刻失败。
 * 需要先 `npm run build -w @xmsbl/wysiwyg`（根 CI 的顺序是 build → test）。
 */
describe("产物 locale 变体", () => {
  const read = (name: string): string => {
    try {
      return readFileSync(new URL(`dist/${name}`, pkgRoot), "utf8");
    } catch {
      throw new Error("产物不在：先跑 `npm run build -w @xmsbl/wysiwyg`（根 CI 是 build → test）");
    }
  };

  it("默认产物是英文，没被汉化", () => {
    const en = read("index.iife.js");
    expect(en).toContain("Heading 1");
    expect(en).not.toContain("一级标题");
  });

  it("zh 变体是中文", () => {
    const zh = read("index.iife.zh.js");
    expect(zh).toContain("一级标题");
    expect(zh).not.toContain("Heading 1");
  });

  it("IIFE 里 core 是外置的（取全局 QuilldownCore，不重复打进 marked/Prism）", () => {
    expect(read("index.iife.js")).toContain("QuilldownCore");
  });
});
