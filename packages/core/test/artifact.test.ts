import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * **产物**守卫（跑的是 `dist/index.iife.js`，不是 src）：
 * ① 语言组件必须真的在产物里 —— `package.json` 一旦标回 `sideEffects: false`，
 *    rollup 会把 `import "prismjs/components/..."` 整段摇掉（代码块静默不高亮，单测看不出来）；
 * ② `Prism.manual` 预置必须**先于** prismjs 求值 —— 否则 prism 会在 DOMContentLoaded 扫全站做自动高亮
 *    （库该做的只是「给你字符串 → 还你 HTML」，不碰宿主 DOM）。
 * 需要先 `npm run build -w @quilldown/core`（根 CI 已把 build 排在 test 前）。
 */
const ARTIFACT = new URL("../dist/index.iife.js", import.meta.url);

/** 在「像浏览器」的沙箱里求值 IIFE（补最小 DOM 桩；prism 只在 `typeof document !== "undefined"` 时才碰 DOM） */
function loadArtifact() {
  let source: string;
  try {
    source = readFileSync(ARTIFACT, "utf8");
  } catch {
    throw new Error(
      "产物不在：先跑 `npm run build -w @quilldown/core`（根 CI 的顺序是 build → test）",
    );
  }

  const counters = { scheduled: 0, scanned: 0 };
  const globalScope = globalThis as unknown as Record<string, unknown>;

  class ElementStub {}
  class HTMLElementStub {}
  class NodeStub {}

  globalScope.Element = ElementStub;
  globalScope.HTMLElement = HTMLElementStub;
  globalScope.Node = NodeStub;
  globalScope.window = globalThis;
  globalScope.requestAnimationFrame = () => {
    counters.scheduled += 1;
  };
  globalScope.setTimeout = () => {
    counters.scheduled += 1;
    return 0;
  };
  globalScope.document = {
    currentScript: null,
    readyState: "complete",
    scripts: [],
    getElementsByTagName: () => [],
    addEventListener: () => {},
    querySelectorAll: () => {
      counters.scanned += 1;
      return [];
    },
  };

  const factory = new Function(`${source}; return QuilldownCore;`);
  const api = factory() as {
    CONTRACT_VERSION: string;
    PRISM_LANGUAGES: readonly string[];
    renderHtml: (md: string) => string;
  };

  return { api, counters, prism: globalScope.Prism as { manual?: boolean; languages: object } };
}

describe("dist/index.iife.js", () => {
  it("自带全部 13 种语言（组件没被摇掉）", () => {
    const { api, prism } = loadArtifact();

    expect(api.CONTRACT_VERSION).toBe("1");
    expect([...api.PRISM_LANGUAGES]).toHaveLength(13);
    for (const language of api.PRISM_LANGUAGES) {
      expect(Object.keys(prism.languages), language).toContain(language);
    }
    expect(api.renderHtml("```csharp\nvar x = 1;\n```")).toContain('class="token keyword"');
  });

  it("不扫宿主 DOM（manual 预置生效：无自动高亮、无 querySelectorAll）", () => {
    const { counters, prism } = loadArtifact();

    expect(prism.manual).toBe(true);
    expect(counters.scheduled).toBe(0);
    expect(counters.scanned).toBe(0);
  });
});
