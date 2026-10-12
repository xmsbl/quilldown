/**
 * 落库 HTML 的**渲染层**：标题 `id` 锚点 + Prism 代码高亮 + 顶级块行锚点。
 *
 * 口径与 `@xmsbl/quilldown-core` 的 `renderHtml` / `renderDocument` 一致 ——
 * 这一层是「编辑器编辑面」与「分屏预览 / 宿主动产出」共用的唯一渲染规则。
 */

import type { Renderer, RendererObject, Token, Tokens } from "marked";

import { prismGrammar } from "./languages.js";
import Prism from "./prism/index.js";
import { createSlugger } from "./slug.js";

const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** 转义 HTML 文本（`& < > " '` 五个字符） */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ENTITIES[ch] ?? ch);
}

const UNESCAPES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
  "&nbsp;": " ",
};

/** 剥标签 + 解基本实体 → 纯文本（标题锚点取文字用） */
function htmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:amp|lt|gt|quot|#39|#x27|nbsp);/g, (entity) => UNESCAPES[entity] ?? entity);
}

let slug: (text: string) => string = createSlugger();

/** 每次渲染前重置：`id` 必须文档内唯一 → 去重表不能跨文档复用 */
export function resetSlugger(): void {
  slug = createSlugger();
}

/** 默认高亮：只处理收录语言；单块高亮失败**不许**炸整篇正文 → 回退纯转义 */
export function highlightCode(code: string, language: string): string | undefined {
  const grammar = language ? prismGrammar(language) : undefined;
  if (!grammar) return undefined;
  try {
    return Prism.highlight(code, grammar, language);
  } catch {
    return undefined;
  }
}

/**
 * 代码块渲染（Prism 感知）。
 * 插件在 `renderer.code` 里要「让位」时**别 `return false`** —— 那会掉到 marked 的
 * 默认渲染器，Prism 高亮会静默丢掉；直接调这个函数。
 */
export function renderCode({ text, lang, escaped }: Tokens.Code): string {
  // 围栏信息串可能带额外参数（```js title=demo）→ 只取第一个词当语言
  const language = (lang ?? "").trim().split(/\s+/)[0] ?? "";
  const klass = language ? ` class="language-${escapeHtml(language)}"` : "";
  // 上游默认渲染器把 code 规整成「恰好一个尾随换行」；保留这个口径 ——
  // 编辑器的代码块靠这个尾换行放光标（ZWSP 尾随行），少了它会少一行。
  const code = text.replace(/\n$/, "") + "\n";
  const body = escaped ? code : (highlightCode(code, language) ?? escapeHtml(code));
  return `<pre><code${klass}>${body}</code></pre>\n`;
}

/** 标题带 `id` 锚点（前台目录靠它跳转），同名标题追加 `-1` / `-2` */
function renderHeading(this: Renderer, { tokens, depth }: Tokens.Heading): string {
  const inner = this.parser.parseInline(tokens);
  const id = slug(htmlToText(inner));

  return `<h${depth} id="${escapeHtml(id)}">${inner}</h${depth}>\n`;
}

/**
 * 我们的渲染层。由 `createMarkdownDocumentRenderer` **先 `use`**，
 * 插件仍可用 `marked.use({ renderer })` 覆盖单个方法。
 */
export function buildRendererLayer(): RendererObject {
  return { heading: renderHeading, code: renderCode };
}

/**
 * 顶级**元素型** token —— 与渲染出来的顶级元素**一一对应且同序**。
 * 排除 `space`（空行）/ `def`（链接定义）/ `html`（原始 HTML 被转义成文本节点，不是元素）。
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

/** 一个**顶级块**的源文行区间（0 起、含首含尾） */
export interface LineAnchor {
  line: number;
  endLine: number;
}

/** 顶级 token 流 → 元素型块的行区间（`raw` 的换行数就是行数，与 marked 的 token 口径一致） */
export function lineAnchors(tokens: Token[]): LineAnchor[] {
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
