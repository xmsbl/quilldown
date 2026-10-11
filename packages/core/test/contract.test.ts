import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { CONTRACT_VERSION, renderHtml } from "../src/index";

describe("core", () => {
  it("exposes the frozen contract version", () => {
    expect(CONTRACT_VERSION).toBe("1");
  });

  // 两处暴露（`CONTRACT.md` 头部 + 导出常量）必须同步 —— 漂移了没人会立刻发现
  it("keeps CONTRACT.md header in sync with the exported constant", () => {
    const doc = readFileSync(
      fileURLToPath(new URL("../../../CONTRACT.md", import.meta.url)),
      "utf8",
    );
    expect(doc).toMatch(new RegExp(`^# Quilldown Contract v${CONTRACT_VERSION}$`, "m"));
  });

  it("exposes the single render entry (唯一产出 HTML 处)", () => {
    expect(typeof renderHtml).toBe("function");
    expect(renderHtml("# hi")).toContain("<h1");
  });
});
