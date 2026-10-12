/**
 * 管线已抽到 `@xmsbl/quilldown-render`（**唯一一份**，core / split / 本包共用）。
 *
 * 这里只是薄转发 —— 上游那一堆 `./parse.js` 引用（editor / clipboard / testing…）不必动。
 */

export {
  parseMarkdown,
  createMarkdownParser,
  createMarkdownDocumentRenderer,
  decorateTaskLists,
} from "@xmsbl/quilldown-render";
export type { ParseOptions, RenderedDocument } from "@xmsbl/quilldown-render";
