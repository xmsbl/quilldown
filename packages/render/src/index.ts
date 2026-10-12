/**
 * `@xmsbl/quilldown-render` —— **唯一**的 markdown → HTML 管线。
 *
 * 编辑器的编辑面、分屏预览、宿主落库都走这一份：GFM 解析（marked）+
 * 内容安全（sanitize）→ 标题 `id` 锚点 + Prism 代码高亮 → 顶级块行锚点。
 */

export {
  parseMarkdown,
  renderHtml,
  renderDocument,
  createMarkdownParser,
  createMarkdownDocumentRenderer,
  decorateTaskLists,
} from "./parse.js";
export type { ParseOptions, RenderedDocument } from "./parse.js";

export { sanitizeHtml } from "./sanitize.js";
export type { SanitizeOptions } from "./sanitize.js";

export { escapeHtml, highlightCode, lineAnchors, renderCode } from "./render.js";
export type { LineAnchor } from "./render.js";

export { PRISM_LANGUAGES, prismGrammar } from "./languages.js";
export type { PrismLanguage } from "./languages.js";

export { createSlugger, slugify } from "./slug.js";
