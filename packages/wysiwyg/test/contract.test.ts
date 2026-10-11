import { describe, expect, it } from "vitest";

import { CONTRACT_VERSION, create, resolveStrings, scanHeadings, stripInline } from "../src/index";

describe("wysiwyg 包对 CONTRACT v1 的形状", () => {
  it("暴露冻结契约版本（与 core 同一个）", () => {
    expect(CONTRACT_VERSION).toBe("1");
  });

  it("工厂与库自有出口都在", () => {
    expect(typeof create).toBe("function");
    expect(typeof scanHeadings).toBe("function");
    expect(typeof stripInline).toBe("function");
    expect(typeof resolveStrings).toBe("function");
  });
});
