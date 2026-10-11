/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { renderDocument, renderHtml } from "../src/index";

/**
 * `renderDocument` 的**行锚点**契约：`anchors[i]` 就是 `html` 里第 i 个顶级元素在源文里的行区间。
 *
 * 为什么值得测：分屏的滚动同步拿这份映射把「源第 N 行」换算成「预览第几像素」——
 * 一旦锚点数或顺序与 DOM 对不上（比如某个 token 忽然变成产出元素的），
 * **不会报错**，只是预览跟着源文乱跳。这里是那个静默失败的唯一防线。
 */
const CORPUS = [
  "# 标题\n\n正文一段\n",
  "# a\n\n[x]: /y\n\n<div>raw</div>\n\npara\n\n---\n\n| a | b |\n| - | - |\n| 1 | 2 |\n",
  "> 引用\n\n```ts\nconst x = 1;\n```\n\n- 一\n- 二\n\n1. 有序\n",
  "**粗** 与 `码`\n\n\n\n尾段\n",
  "只有一段，没有空行",
  "",
  "   \n\n",
];

describe("renderDocument", () => {
  it("渲染出的 HTML 与 renderHtml 逐字节一致（同一个渲染器，不是另一套）", () => {
    for (const md of CORPUS) {
      expect(renderDocument(md).html, md).toBe(renderHtml(md));
    }
  });

  it("anchors 与 HTML 的顶级元素逐位对齐（数量 + 顺序 + 标签形状）", () => {
    for (const md of CORPUS) {
      const { html, anchors } = renderDocument(md);
      const box = document.createElement("div");
      box.innerHTML = html;

      // 元素型 token 与顶级元素应当一一对应 —— 多一个/少一个就是映射整体错位
      expect(anchors.length, md).toBe(box.children.length);
    }
  });

  it("行区间指回源文（逐块核对起始行）", () => {
    const md = "# 标题\n\n正文一段\n\n```js\ncode\n```\n";
    const { anchors } = renderDocument(md);

    expect(anchors).toEqual([
      { line: 0, endLine: 0 },
      { line: 2, endLine: 2 },
      { line: 4, endLine: 6 },
    ]);
  });

  it("行区间单调不减、落在源文范围内", () => {
    for (const md of CORPUS) {
      const { anchors } = renderDocument(md);
      const lines = md.split("\n").length;

      for (const [i, anchor] of anchors.entries()) {
        expect(anchor.line, md).toBeGreaterThanOrEqual(0);
        expect(anchor.endLine, md).toBeGreaterThanOrEqual(anchor.line);
        expect(anchor.endLine, md).toBeLessThan(lines);
        if (i > 0) expect(anchor.line, md).toBeGreaterThanOrEqual(anchors[i - 1]!.endLine);
      }
    }
  });

  it("不产元素的东西（空行 / 链接定义 / 原始 HTML）不占锚点", () => {
    const { html, anchors } = renderDocument("[x]: /y\n\n<div>raw</div>\n\n段落\n");
    const box = document.createElement("div");
    box.innerHTML = html;

    expect(box.querySelectorAll("div, p")).toHaveLength(1); // 原始 HTML 被转义成文本，不是元素
    expect(anchors).toHaveLength(1);
    expect(anchors[0]).toEqual({ line: 4, endLine: 4 });
  });
});
