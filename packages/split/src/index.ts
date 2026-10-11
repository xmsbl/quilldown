/**
 * `@quilldown/split` —— 分屏 Markdown 编辑器（源码 + 预览 + 滚动同步）。
 *
 * 与 `@quilldown/wysiwyg` **同一份契约**（`CONTRACT.md` v1）：`create(mount, opts)` 进，
 * `getMarkdown` / `getHtml` / `setMarkdown` / `isDirty` / `destroy` 出；落库 HTML 恒由
 * `@quilldown/core` 产出 —— 两款编辑器产出逐字节一致，宿主只写一套 sanitize。
 * 样式是单独入口：`import "@quilldown/split/index.css"`（库不运行时注入 CSS）。
 */
export { CONTRACT_VERSION } from "@quilldown/core";
export type { EditorInstance, EditorOptions, UploadFn } from "@quilldown/core";

export { create, type SplitOptions } from "./create";
export { BUILTIN_STRINGS, resolveStrings, type SplitStrings } from "./strings";
export { interpolateMap, writeLineAnchors, type AnchorPoint, type ScrollSync } from "./scroll-sync";
export { TOOLBAR_ACTIONS, type ToolbarAction } from "./toolbar";
