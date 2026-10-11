import { describe, expect, it } from "vitest";

import { createSlugger, slugify } from "../src/slug";

describe("slugify", () => {
  it("ASCII 转小写、空白转 -、去标点", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("  多  空格  ")).toBe("多-空格");
  });

  it("中文 / 其他 Unicode 字母保留（锚点可读）", () => {
    expect(slugify("时间口径")).toBe("时间口径");
    expect(slugify("Café 部署")).toBe("café-部署");
    expect(slugify("前缀-`code`")).toBe("前缀-code");
  });

  it("全标点 / 全空白 → 空串（由 slugger 回退 section）", () => {
    expect(slugify("!!!")).toBe("");
    expect(slugify("   ")).toBe("");
    expect(slugify("---")).toBe("");
  });
});

describe("createSlugger", () => {
  it("同名依次追加 -1 / -2", () => {
    const slug = createSlugger();
    expect([slug("A"), slug("A"), slug("A"), slug("B"), slug("A")]).toEqual([
      "a",
      "a-1",
      "a-2",
      "b",
      "a-3",
    ]);
  });

  it("回退 section（与迁移前的落库 HTML 一致）", () => {
    const slug = createSlugger();
    expect([slug("!!!"), slug("???")]).toEqual(["section", "section-1"]);
  });

  it("去重表不跨实例（同一份文档两次渲染锚点一致）", () => {
    const first = createSlugger();
    const second = createSlugger();
    expect(first("A")).toBe(second("A"));
  });
});
