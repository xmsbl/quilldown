/**
 * `@xmsbl/quilldown-wysiwyg` —— 所见即所得 Markdown 编辑器（contenteditable，基于 edodo-write）。
 *
 * 只产出 markdown；落库 HTML 恒由**唯一管线**产出（`@xmsbl/quilldown-render`，`core` 再导出）。
 * 编辑器本体是 `@xmsbl/quilldown-edodo`（fork，见其 `UPSTREAM.md`）——**依赖**而非 vendor；
 * 中文化走运行时的 `locale: "zh"`，不再「一个 locale 一份产物」。
 */
export { CONTRACT_VERSION } from "@xmsbl/quilldown-core";
export type { EditorInstance, EditorOptions, UploadFn } from "@xmsbl/quilldown-core";

export { create, type WysiwygOptions } from "./create.js";
export { BUILTIN_STRINGS, resolveStrings, type EditorStrings } from "./strings.js";
export { scanHeadings, stripInline, type TocHeading } from "./toc.js";
