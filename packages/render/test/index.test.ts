import { describe, expect, it } from "vitest";

import { createMarkdownDocumentRenderer, parseMarkdown, renderCode } from "../src/index.js";

describe("@xmsbl/quilldown-render", () => {
  it("标题带 id 锚点（中文保留 Unicode，同名追加 -1）", () => {
    const md = "# 标题\n\n## 标题\n";
    const html = parseMarkdown(md);
    expect(html).toContain('<h1 id="标题">');
    expect(html).toContain('<h2 id="标题-1">');
  });

  it("代码块走 Prism 高亮；未收录语言回退转义", () => {
    expect(parseMarkdown("```js\nconst a = 1;\n```")).toContain('<span class="token keyword">');
    expect(parseMarkdown("```nosuchlang\n<b>x</b>\n```")).toContain("&lt;b&gt;");
  });

  it("renderDocument 给出顶级块与源行的对应", () => {
    const { html, anchors } = createMarkdownDocumentRenderer()(
      "# T\n\nbody\n\n```js\nconst a = 1;\n```\n",
    );
    expect(html).toContain('<h1 id="t">');
    expect(anchors[0]).toEqual({ line: 0, endLine: 0 });
    expect(anchors[1]).toEqual({ line: 2, endLine: 2 });
  });

  it("原始 HTML 一律转义；任务列表装饰可关", () => {
    expect(parseMarkdown("<script>alert(1)</script>")).not.toContain("<script>");
    const decorated = parseMarkdown("- [x] done");
    expect(decorated).toContain("task-list-item");
    expect(parseMarkdown("- [x] done", { decorateTasks: false })).not.toContain("task-list-item");
  });

  it("renderCode 可被插件当‘让位’出口复用", () => {
    expect(renderCode({ type: "code", raw: "", text: "const a = 1;\n", lang: "js" })).toContain(
      '<span class="token keyword">',
    );
  });
});
