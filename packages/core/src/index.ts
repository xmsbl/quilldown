/**
 * @quilldown/core —— 契约常量 + 共享类型 + 渲染管线。
 *
 * 硬规则：本包是**唯一**产出落库 HTML 的地方（marked GFM + Prism）；
 * 编辑器包只产出 markdown，落库 HTML 一律走 {@link renderHtml}。
 */
export { CONTRACT_VERSION } from "./contract";
export {
  bindForm,
  FORM_SELECTOR,
  HTML_FIELD_SELECTOR,
  MD_FIELD_SELECTOR,
  type FormBinding,
} from "./form";
export { PRISM_LANGUAGES, prismGrammar, type PrismLanguage } from "./languages";
export { renderHtml, type Highlight, type RenderOptions } from "./render";
export type {
  EditorCreate,
  EditorInstance,
  EditorOptions,
  FormBindOptions,
  FormField,
  RenderHtml,
  UploadFn,
} from "./types";
