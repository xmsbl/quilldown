import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * **产物**守卫（跑的是 `dist/index.iife.js`，不是 src）。
 *
 * ① IIFE 必须是「**先引 core**」的自足单文件：core 走全局 `QuilldownCore`（外置），
 *    marked / Prism 不许被打第二遍 —— 否则宿主页面里跑两套词法器（体积翻倍、token 类名可能不一致）。
 * ② 全局名固定 `QuilldownSplit`（CONTRACT §2：每包一个独立全局名，互不覆盖）。
 *
 * 需要先 `npm run build -w @quilldown/split`（根 CI 已把 build 排在 test 前）。
 */
const ARTIFACT = new URL("../dist/index.iife.js", import.meta.url);

function read(): string {
  try {
    return readFileSync(ARTIFACT, "utf8");
  } catch {
    throw new Error(
      "产物不在：先跑 `npm run build -w @quilldown/split`（根 CI 的顺序是 build → test）",
    );
  }
}

describe("dist/index.iife.js", () => {
  it("core 外置、全局名固定、没把 marked / Prism 打进来", () => {
    const source = read();

    expect(source).toContain("QuilldownCore");
    expect(source).toContain("var QuilldownSplit");
    expect(source).not.toContain("Prism");
    expect(source).not.toContain("marked");
  });

  it("在「已经引了 core」的沙箱里求值 → 拿到完整出口", () => {
    const source = read();
    const scope = globalThis as unknown as Record<string, unknown>;
    scope.QuilldownCore = { CONTRACT_VERSION: "1" };

    const factory = new Function(`${source}; return QuilldownSplit;`);
    const api = factory() as {
      CONTRACT_VERSION: string;
      create: unknown;
      interpolateMap: unknown;
      writeLineAnchors: unknown;
      TOOLBAR_ACTIONS: unknown;
      BUILTIN_STRINGS: Record<string, unknown>;
    };

    expect(api.CONTRACT_VERSION).toBe("1");
    expect(typeof api.create).toBe("function");
    expect(typeof api.interpolateMap).toBe("function");
    expect(typeof api.writeLineAnchors).toBe("function");
    expect(Array.isArray(api.TOOLBAR_ACTIONS)).toBe(true);
    expect(Object.keys(api.BUILTIN_STRINGS)).toEqual(["en", "zh"]);
  });
});
