import { describe, expect, it } from "vitest";

import { PRISM_LANGUAGES, prismGrammar } from "../src/index";

/**
 * 语言集守卫：`PRISM_LANGUAGES`（对外冻结表）必须**逐个**真的加载到语法。
 * 漏一个（表里写了、组件没引）= 该语言代码块静默不高亮 —— 这条测试就是拦它的。
 */
describe("语言集", () => {
  it("冻结表 = 迁移前 Inkwell `wwwroot/lib/prism/*` 的 13 个文件", () => {
    expect([...PRISM_LANGUAGES]).toEqual([
      "markup",
      "css",
      "clike",
      "javascript",
      "typescript",
      "json",
      "bash",
      "python",
      "sql",
      "csharp",
      "yaml",
      "markdown",
      "diff",
    ]);
  });

  it.each([...PRISM_LANGUAGES])("%s 已加载语法", (language) => {
    expect(prismGrammar(language)).toBeTruthy();
  });

  it("别名也解析得到（Prism 自己登记的 html / js / ts / cs / yml …）", () => {
    for (const alias of ["html", "js", "ts", "cs", "yml", "md", "py", "sh"]) {
      expect(prismGrammar(alias)).toBeTruthy();
    }
  });

  it("未收录语言 → undefined（调用方回退纯转义）", () => {
    expect(prismGrammar("caddyfile")).toBeUndefined();
    expect(prismGrammar("")).toBeUndefined();
  });
});
