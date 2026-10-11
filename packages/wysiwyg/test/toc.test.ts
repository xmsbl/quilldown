import { describe, expect, it } from "vitest";

import { scanHeadings, stripInline } from "../src/index";

describe("大纲扫描（markdown 真相源）", () => {
  it("只收一 / 二 / 三级标题", () => {
    expect(scanHeadings("# a\n## b\n### c\n#### d\n##### e")).toEqual([
      { level: 1, text: "a" },
      { level: 2, text: "b" },
      { level: 3, text: "c" },
    ]);
  });

  it("跳过围栏代码块（``` 与 ~~~）", () => {
    const md = ["```md", "# 代码里的标题", "```", "~~~", "## 也不是", "~~~", "# 真的"].join("\n");
    expect(scanHeadings(md)).toEqual([{ level: 1, text: "真的" }]);
  });

  it("闭合式标题的尾井号不算进文案", () => {
    expect(scanHeadings("## 标题 ##")).toEqual([{ level: 2, text: "标题" }]);
  });

  it("剥掉标题里的行内标记", () => {
    expect(scanHeadings("# ![图](a.png) [链](b) **粗** _斜_ `码`")[0]?.text).toBe("图 链 粗 斜 码");
  });

  it("缩进超过 3 空格的不算标题", () => {
    expect(scanHeadings("    # 不是标题")).toEqual([]);
  });
});

describe("stripInline", () => {
  it("图片保留 alt、链接保留文字", () => {
    expect(stripInline("![alt](x) [text](y)")).toBe("alt text");
  });
});
