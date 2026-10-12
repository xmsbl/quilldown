import { describe, expect, it } from "vitest";

import { renderHtml } from "../src/index";

/** md → html 用例集：每条只测**一段**行为，改口径时一眼看得出坏在哪 */
describe("renderHtml: GFM 基本块", () => {
  it("段落与行内标记", () => {
    expect(renderHtml("普通段落")).toBe("<p>普通段落</p>\n");
    expect(renderHtml("**粗** 与 *斜* 与 `码`")).toBe(
      "<p><strong>粗</strong> 与 <em>斜</em> 与 <code>码</code></p>\n",
    );
  });

  it("标题带 id 锚点（同名去重、中文保留）", () => {
    const html = renderHtml("# 时间口径\n\n## 时间口径\n\n### What Is It?");
    expect(html).toContain('<h1 id="时间口径">时间口径</h1>');
    expect(html).toContain('<h2 id="时间口径-1">时间口径</h2>');
    expect(html).toContain('<h3 id="what-is-it">What Is It?</h3>');
  });

  it("标题只有标点时回退 section（与迁移前的落库 HTML 一致）", () => {
    expect(renderHtml("## !!!\n\n## ???")).toContain('<h2 id="section">!!!</h2>');
    expect(renderHtml("## !!!\n\n## ???")).toContain('<h2 id="section-1">???</h2>');
  });

  it("列表 / 引用 / 分隔线", () => {
    expect(renderHtml("- a\n- b\n")).toBe("<ul>\n<li>a</li>\n<li>b</li>\n</ul>\n");
    expect(renderHtml("1. a\n")).toBe("<ol>\n<li>a</li>\n</ol>\n");
    expect(renderHtml("> 引用\n")).toBe("<blockquote>\n<p>引用</p>\n</blockquote>\n");
    expect(renderHtml("---\n")).toBe("<hr>\n");
  });

  it("GFM 表格 / 删除线 / 任务列表 / 自动链接", () => {
    expect(renderHtml("| a | b |\n| - | - |\n| 1 | 2 |\n")).toContain("<table>");
    expect(renderHtml("~~删~~")).toBe("<p><del>删</del></p>\n");
    expect(renderHtml("- [x] 做完了\n")).toContain('<li class="task-list-item" data-task="done">');
    expect(renderHtml("- [x] 做完了\n")).toContain('<input checked="" type="checkbox">');
    expect(renderHtml("见 https://example.com/x 。")).toContain(
      '<a href="https://example.com/x">https://example.com/x</a>',
    );
  });

  it("链接与图片", () => {
    expect(renderHtml("[名](/page/a)")).toBe('<p><a href="/page/a">名</a></p>\n');
    expect(renderHtml("![alt](/uploads/a.png)")).toBe(
      '<p><img src="/uploads/a.png" alt="alt"></p>\n',
    );
  });

  it("breaks 关：单个换行不折行（与迁移前一致）", () => {
    expect(renderHtml("a\nb")).toBe("<p>a\nb</p>\n");
  });
});

describe("renderHtml: 原始 HTML 走 sanitize 白名单", () => {
  it("块级 <script> 整段丢掉（连内容一起，不构成可见文本）", () => {
    const html = renderHtml("<script>alert(1)</script>\n");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("alert(1)");
  });

  it("白名单内的标签作为真元素存活（div 允许）", () => {
    expect(renderHtml("<div>x</div>\n")).toContain("<div>x</div>");
  });
});

describe("renderHtml: 代码高亮", () => {
  it("带语言：Prism token + language- 类", () => {
    const html = renderHtml("```csharp\nvar x = 1; // c\n```\n");
    expect(html).toContain('<pre><code class="language-csharp">');
    expect(html).toContain('<span class="token keyword">var</span>');
    expect(html).toContain('<span class="token comment">// c</span>');
  });

  it("代码里的 HTML 只作为文字存在（不逃出代码块、不被当标签）", () => {
    const html = renderHtml("```html\n<b>hi</b>\n```\n");
    expect(html).toContain('<code class="language-html">');
    expect(html).toContain('class="token tag"');
    expect(html).not.toContain("<b>hi</b>");
  });

  it("未收录语言：不高亮、照样带 language- 类（CSS 钩子保留）", () => {
    expect(renderHtml("```caddyfile\nroot * /srv\n```\n")).toBe(
      '<pre><code class="language-caddyfile">root * /srv\n</code></pre>\n',
    );
  });

  it("无语言：纯转义", () => {
    expect(renderHtml("```\nplain & text\n```\n")).toBe(
      "<pre><code>plain &amp; text\n</code></pre>\n",
    );
  });

  it("围栏信息串只取第一个词当语言", () => {
    const html = renderHtml("```ts title=demo.ts\nconst x: number = 1;\n```\n");
    expect(html).toContain('<code class="language-ts">');
    expect(html).toContain('<span class="token keyword">const</span>');
  });

  it("多行代码保留行结构（末尾恰好一个换行 —— 上游口径，编辑器光标行靠它）", () => {
    expect(renderHtml("```\na\nb\n```\n")).toBe("<pre><code>a\nb\n</code></pre>\n");
  });
});

describe("renderHtml: 纯函数", () => {
  it("同一份 md 恒产出同一份 HTML（两个编辑器逐字节一致的前提）", () => {
    const md = "# T\n\n```ts\nconst a = 1;\n```\n";
    expect(renderHtml(md)).toBe(renderHtml(md));
  });

  it("空 / null 入参 → 空串（不炸）", () => {
    expect(renderHtml("")).toBe("");
    expect(renderHtml(null as unknown as string)).toBe("");
  });
});
