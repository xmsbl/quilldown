/**
 * 渲染管线已抽到 `@xmsbl/quilldown-render`（**唯一一份**，core / split / 所见即所得 共用）。
 *
 * 这里只做转发，保持 core 既有的导出名 —— 宿主的 `import { renderHtml } from "@xmsbl/quilldown-core"`
 * 照旧可用。
 */

export { renderDocument, renderHtml } from "@xmsbl/quilldown-render";
export type { LineAnchor, RenderedDocument } from "@xmsbl/quilldown-render";
