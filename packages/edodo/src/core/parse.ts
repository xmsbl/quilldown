/**
 * Markdown → HTML.
 *
 * `marked` in GFM mode does the parsing; `sanitizeHtml` locks the output down
 * to the editor's tag/attribute allow-list. Task lists are decorated with the
 * conventional `contains-task-list` / `task-list-item` classes so CSS can style
 * them and the editor can find the checkboxes.
 *
 * Instancing: each parser owns a `new Marked()` — never the global `marked`
 * singleton, whose options/extensions would leak into every other consumer of
 * marked on the page. `createMarkdownParser` accepts plugin extensions;
 * `parseMarkdown` stays bound to a default instance.
 */

import { Marked, type MarkedExtension, type Token } from "marked";
import { parseDocument, DomUtils } from "htmlparser2";
import render from "dom-serializer";
import { isTag, type Element } from "domhandler";
import { buildRendererLayer, lineAnchors, resetSlugger, type LineAnchor } from "./render.js";
import { sanitizeHtml, type SanitizeOptions } from "./sanitize.js";

export interface ParseOptions {
  /**
   * Run the output through the built-in sanitiser. The sanitiser is DOM-free,
   * so it runs everywhere (browsers, jsdom/happy-dom tests, and bare Node /
   * SSR). Set `false` for a trusted-input fast path that returns raw `marked`
   * HTML. Default: true.
   */
  sanitize?: boolean;
  /**
   * Make task-list checkboxes interactive (editor classes + enabled inputs).
   * Set `false` for export paths (e.g. the clipboard's HTML flavor) where
   * GFM's native disabled checkboxes are the right semantics. Default: true.
   */
  decorateTasks?: boolean;
}

/**
 * 渲染产物的两个半边：HTML + **顶级块的行锚点**（分屏滚动同步用）。
 *
 * 与 `createMarkdownParser` 走的是**同一条** lex→parse 路径，所以 `html` 逐字节一致；
 * 行锚点只是同一份 token 流的副产物（不额外渲染一次）。
 */
export interface RenderedDocument {
  html: string;
  anchors: LineAnchor[];
}

/**
 * 建一个「文档渲染器」：同一份 markdown 恒产出同一份 HTML + 锚点。
 *
 * 渲染规则由 `./render.js` 的渲染层提供（标题 `id` 锚点 + Prism 代码高亮）——
 * 编辑器的编辑面、分屏预览、宿主落库**共用这一层**。
 */
export function createMarkdownDocumentRenderer(
  extensions: MarkedExtension[] = [],
  sanitizeOptions?: SanitizeOptions,
): (md: string, opts?: ParseOptions) => RenderedDocument {
  const marked = new Marked({ gfm: true, breaks: false });
  // 先 use 我们的渲染层：插件仍可用 `marked.use({ renderer })` 覆盖单个方法；
  // 插件要「让位」时别 `return false`，改调 `renderCode`（见 `./render.js`）。
  marked.use({ renderer: buildRendererLayer() });
  for (const ext of extensions) marked.use(ext);
  return (md: string, opts: ParseOptions = {}): RenderedDocument => {
    resetSlugger(); // 标题 id 必须文档内唯一 → 每份文档一套去重表
    const src = String(md ?? "");
    // ⚠ 必须走 `marked.parse()`：只有它会跑插件的 `hooks.postprocess`
    // （脚注的尾段就是在那里拼的）；拆成 lexer+parser 会静默丢掉。
    const raw = String(marked.parse(src, { async: false }));
    // 行锚点另取一份 token 流：与上面同源同参数，块顺序恒一致。
    const tokens = marked.lexer(src) as Token[];
    // The sanitiser is DOM-free — it ALWAYS runs (browser, jsdom, or bare
    // Node/SSR) unless the caller opts into the trusted-input fast path.
    const html =
      opts.sanitize === false
        ? raw
        : opts.decorateTasks === false
          ? sanitizeHtml(raw, sanitizeOptions)
          : decorateTaskLists(sanitizeHtml(raw, sanitizeOptions));
    return { html, anchors: lineAnchors(tokens) };
  };
}

export function createMarkdownParser(
  extensions: MarkedExtension[] = [],
  sanitizeOptions?: SanitizeOptions,
): (md: string, opts?: ParseOptions) => string {
  const renderDocument = createMarkdownDocumentRenderer(extensions, sanitizeOptions);
  return (md: string, opts?: ParseOptions) => renderDocument(md, opts).html;
}

const defaultParse = (() => {
  let fn: ((md: string, opts?: ParseOptions) => string) | null = null;
  return (md: string, opts?: ParseOptions) => (fn ??= createMarkdownParser())(md, opts);
})();

/** Convert a Markdown string to HTML (default parser, no extensions). */
export function parseMarkdown(md: string, opts: ParseOptions = {}): string {
  return defaultParse(md, opts);
}

/** Add a class to an element's `class` attribute (deduped, like classList). */
function addClass(el: Element, cls: string): void {
  const classes = (el.attribs.class ?? "").split(/\s+/).filter(Boolean);
  if (!classes.includes(cls)) classes.push(cls);
  el.attribs.class = classes.join(" ");
}

/**
 * Add `contains-task-list` / `task-list-item` classes to GFM task lists so
 * they can be styled and located. DOM-free — safe in bare Node / SSR.
 */
export function decorateTaskLists(html: string): string {
  const doc = parseDocument(html ?? "", { decodeEntities: true });
  const inputs = DomUtils.findAll(
    (el) => el.name === "input" && el.attribs.type === "checkbox",
    doc.children,
  );
  for (const input of inputs) {
    // The checkbox must sit directly in an <li>, or in a <p> directly in an <li>.
    let li: Element | null = null;
    const parent = input.parent;
    if (parent && isTag(parent)) {
      if (parent.name === "li") li = parent;
      else if (parent.name === "p" && parent.parent && isTag(parent.parent) && parent.parent.name === "li") {
        li = parent.parent;
      }
    }
    if (!li) continue;
    // GFM renders task checkboxes `disabled`; the editor makes them interactive.
    delete input.attribs.disabled;
    addClass(li, "task-list-item");
    li.attribs["data-task"] = "checked" in input.attribs ? "done" : "todo";
    const list = li.parent;
    if (list && isTag(list) && (list.name === "ul" || list.name === "ol")) {
      addClass(list, "contains-task-list");
    }
  }
  return render(doc.children, { encodeEntities: "utf8", emptyAttrs: true });
}
