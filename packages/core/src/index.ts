/**
 * @xmsbl/quilldown-core —— 契约常量 + 共享类型 + 渲染管线。
 *
 * 硬规则：落库 HTML 由**唯一管线** `@xmsbl/quilldown-render` 产出（本包再导出）；
 * 编辑器包只产出 markdown，落库 HTML 一律走 {@link renderHtml}。
 */
export { CONTRACT_VERSION } from "./contract.js";
export {
  bindForm,
  FORM_SELECTOR,
  HTML_FIELD_SELECTOR,
  MD_FIELD_SELECTOR,
  type FormBinding,
} from "./form.js";
export { PRISM_LANGUAGES, prismGrammar, type PrismLanguage } from "@xmsbl/quilldown-render";
export { renderDocument, renderHtml, type LineAnchor, type RenderedDocument } from "./render.js";
export type {
  EditorCreate,
  EditorInstance,
  EditorOptions,
  FormBindOptions,
  FormField,
  RenderHtml,
  UploadFn,
} from "./types.js";
