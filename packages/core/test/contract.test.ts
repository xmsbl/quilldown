import { describe, expect, it } from "vitest";

import { CONTRACT_VERSION, renderHtml } from "../src/index";

describe("core", () => {
  it("exposes the frozen contract version", () => {
    expect(CONTRACT_VERSION).toBe("1");
  });

  it("exposes the single render entry (唯一产出 HTML 处)", () => {
    expect(typeof renderHtml).toBe("function");
    expect(renderHtml("# hi")).toContain("<h1");
  });
});
