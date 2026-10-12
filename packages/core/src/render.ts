import { Marked, type Renderer, type RendererObject, type Token, type Tokens } from "marked";

import { escapeHtml, htmlToText } from "./html.js";
import { prismGrammar } from "./languages.js";
import Prism from "./prism/index.js";
import { createSlugger } from "./slug.js";

/** 自定义语法高亮（默认走内置 Prism）；返回 `undefined` = 交给默认转义（= 不高亮） */
export type Highlight = (code: string, language: string) => string | undefined;

export interface RenderOptions {
  /** 覆盖内置 Prism 高亮（宿主想换主题 / 换高亮器时用；输出必须是**已转义**的 HTML） */
  highlight?: Highlight;
}

/** 一个**顶级块**的源文行区间（0 起、含首含尾）。 */
export interface LineAnchor {
  line: number;
  endLine: number;
}

/** {@link renderDocument} 的产物：HTML + 与其顶级块**逐位对齐**的源行锚点。 */
export interface RenderedDocument {
  html: string;
  anchors: LineAnchor[];
}

/**
 * 顶级**元素型** token —— 与渲染出来的顶级元素**一一对应且同序**。
 * 排除在外的是三类不产元素的东西：`space`（空行）/ `def`（链接定义）/ `html`
 * （原始 HTML 被转义成文本节点，**不是元素**）。分屏滚动同步按这份对应关系把源行号写进预览 DOM。
 */
const TOP_LEVEL_BLOCK_TYPES = new Set([
  "heading",
  "paragraph",
  "code",
  "blockquote",
  "list",
  "table",
  "hr",
]);

/** 顶级 token 流 → 元素型块的行区间（`raw` 的换行数就是行数，与 marked 的 token 口径一致）。 */
function lineAnchors(tokens: Token[]): LineAnchor[] {
  const anchors: LineAnchor[] = [];
  let line = 0;
  for (const token of tokens) {
    const newlines = ((token as { raw?: string }).raw?.match(/\n/g) ?? []).length;
    if (TOP_LEVEL_BLOCK_TYPES.has(token.type)) {
      anchors.push({ line, endLine: line + Math.max(newlines - 1, 0) });
    }
    line += newlines;
  }
  return anchors;
}

/** 默认高亮：只处理收录语言（`language-x` 里的 `x` 直接查 Prism 语法表，别名由 Prism 登记） */
const prismHighlight: Highlight = (code, language) => {
  const grammar = language ? prismGrammar(language) : undefined;
  if (!grammar) return undefined;

  try {
    return Prism.highlight(code, grammar, language);
  } catch {
    // 单个代码块高亮失败（语法边界 bug）不许炸掉整篇正文 → 回退纯转义
    return undefined;
  }
};

/**
 * 渲染器 —— 落库 HTML 的**唯一**产出者（契约 v2 硬规则）。
 *
 * 只用普通对象覆盖**已存在的三个方法**：marked 对未知方法名直接抛错，
 * 而 class 实例的私有字段会成为 renderer 的自有属性、被当成「新方法」→ 所以不用 class。
 *
 * 两条与正文安全相关的口径：
 *  · 原始 HTML **一律转义**（`<script>` 进来只显示成文字 —— 等价于服务端的 `DisableHtml`）；
 *  · 标题带 `id` 锚点（前台目录靠它跳转），同名标题追加 `-1` / `-2`。
 */
function buildRenderer(slug: (text: string) => string, highlight: Highlight): RendererObject {
  return {
    /** 原始 HTML token（块级 + 行内都走这里）→ 转义 */
    html({ text }: Tokens.HTML | Tokens.Tag): string {
      return escapeHtml(text);
    },

    heading(this: Renderer, { tokens, depth }: Tokens.Heading): string {
      const inner = this.parser.parseInline(tokens);
      const id = slug(htmlToText(inner));

      return `<h${depth} id="${escapeHtml(id)}">${inner}</h${depth}>\n`;
    },

    code({ text, lang, escaped }: Tokens.Code): string {
      // 围栏信息串可能带额外参数（```js title=demo）→ 只取第一个词当语言
      const language = (lang ?? "").trim().split(/\s+/)[0] ?? "";
      const klass = language ? ` class="language-${escapeHtml(language)}"` : "";
      // `escaped` = 该 token 上游已转义过（Prism 再跑一遍会二次转义 `&amp;`）→ 直接放行
      const body = escaped ? text : (highlight(text, language) ?? escapeHtml(text));

      return `<pre><code${klass}>${body}</code></pre>\n`;
    },
  };
}

/**
 * Markdown → HTML（GFM：表格 / 删除线 / 任务列表 / 自动链接；`breaks` 关 —— 与迁移前一致）。
 * 无状态纯函数：同一份 md 恒产出同一份 HTML（「两编辑器产出逐字节一致」的前提）。
 * 每次调用建一套 renderer / slugger（锚点去重表不能跨文档复用）。
 */
export function renderHtml(md: string, options: RenderOptions = {}): string {
  return renderDocument(md, options).html;
}

/**
 * 与 {@link renderHtml} **同一份** HTML，外加每个顶级块在源文里的行区间。
 *
 * 为什么要另开一个出口：分屏的滚动同步要「源第 N 行 ↔ 预览某个块」的映射，而这份映射的
 * 前提（哪些顶级 token 会产出元素、顺序如何）**只有渲染器自己知道** —— 让它散到调用方去猜，
 * 猜错了不报错，只是预览跟着源文乱跳。
 *
 * 走的是与 `renderHtml` 完全相同的 lex → parse 路径（同一份 renderer / slugger），
 * 所以两者的 HTML **逐字节一致**，不是「另一套渲染」。
 */
export function renderDocument(md: string, options: RenderOptions = {}): RenderedDocument {
  const renderer = buildRenderer(createSlugger(), options.highlight ?? prismHighlight);
  const parser = new Marked({ gfm: true, breaks: false, async: false, renderer });
  const tokens = parser.lexer(md ?? "");

  // marked 的类型收不窄实例选项（`async: false` 恒同步）→ 只有这一处断言
  return { html: parser.parser(tokens) as string, anchors: lineAnchors(tokens) };
}
