/**
 * `@xmsbl/quilldown-wysiwyg` —— 所见即所得 Markdown 编辑器（contenteditable，基于 edodo-write）。
 *
 * 只产出 markdown；落库 HTML 恒由 `@xmsbl/quilldown-core` 的 `renderHtml` 产出（CONTRACT §1）。
 * edodo 原件从 npm 入库（`vendor/edodo/`），i18n 在构建期施加（`locales/<lang>.tsv`）——
 * 所以产物**一个 locale 一份**（`dist/index.iife.js` = en，`dist/index.iife.zh.js` = zh）。
 */
export { CONTRACT_VERSION } from "@xmsbl/quilldown-core";
export type { EditorInstance, EditorOptions, UploadFn } from "@xmsbl/quilldown-core";

export { create, type WysiwygOptions } from "./create.js";
export { BUILTIN_STRINGS, resolveStrings, type EditorStrings } from "./strings.js";
export { scanHeadings, stripInline, type TocHeading } from "./toc.js";
