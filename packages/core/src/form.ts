/**
 * 表单适配器（CONTRACT §4）—— 可选便利件：把编辑器的 md / html 写进宿主表单的两个字段。
 *
 * 为什么在 core：两款编辑器（wysiwyg / split）共用同一份字段口径 —— 口径写两处必然漂移，
 * 而漂移的后果是静默的（html 字段空着 → 服务端按「JS 没跑」拒收，页面上看不出原因）。
 *
 * 边界：这里**只做字段进出**，不持久化、不拦截提交、不认端点 —— 草稿 / 防丢稿 / 鉴权全归宿主。
 */
import type { EditorInstance, FormBindOptions } from "./types";

/** 适配器默认认的表单（CONTRACT §3）；找不到时回退「挂载点向上最近的 form」。 */
export const FORM_SELECTOR = "form.editor-shell";

/** md 真相源字段（显式属性）。 */
export const MD_FIELD_SELECTOR = "[data-editor-md]";
/** html 产物字段（显式属性）。 */
export const HTML_FIELD_SELECTOR = "[data-editor-html]";

/** 无显式属性时的回退：按 name 后缀认（Razor 的 `Form.` 前缀照样命中）。 */
const MD_FALLBACK_SELECTOR = '[name$=".BodyMd"]';
const HTML_FALLBACK_SELECTOR = '[name$=".BodyHtml"]';

type Field = HTMLInputElement | HTMLTextAreaElement;

export interface FormBinding {
  /** 立即把当前 md / html 写进字段（绑定即刻、提交前、以及宿主手动刷时调用）。 */
  sync(): void;
  destroy(): void;
}

function pickField(form: HTMLFormElement, primary: string, fallback: string): Field | null {
  return form.querySelector<Field>(primary) ?? form.querySelector<Field>(fallback) ?? null;
}

/**
 * 把编辑器接到宿主表单的两个字段上。
 * @returns 绑定句柄；**没表单或两个字段都没有**时返回 `null`（不算错：宿主可能不用表单）。
 */
export function bindForm(
  editor: EditorInstance,
  mount: HTMLElement,
  options: FormBindOptions = {},
): FormBinding | null {
  const form =
    options.form !== undefined
      ? options.form
      : (mount.closest<HTMLFormElement>(FORM_SELECTOR) ?? mount.closest<HTMLFormElement>("form"));
  if (!form) return null;

  // `null` = 显式不要该字段（与「没传 → 自动找」区分开）
  const mdField =
    options.mdField !== undefined
      ? options.mdField
      : pickField(form, MD_FIELD_SELECTOR, MD_FALLBACK_SELECTOR);
  const htmlField =
    options.htmlField !== undefined
      ? options.htmlField
      : pickField(form, HTML_FIELD_SELECTOR, HTML_FALLBACK_SELECTOR);
  if (!mdField && !htmlField) return null;

  function sync(): void {
    if (mdField) mdField.value = editor.getMarkdown();
    if (htmlField) htmlField.value = editor.getHtml();
  }

  /**
   * 提交前必刷：捕获阶段 —— 早于校验 / 序列化 / htmx 的 submit 处理。
   * 少了这一步，编辑器内建去抖还没落盘的改动会**静默丢**（表单读到的是上一次的值）。
   */
  function onSubmitCapture(event: Event): void {
    if (event.target === form) sync();
  }

  /** 草稿恢复的入口：宿主把 md 塞回字段并派发 `input` → 回灌编辑器（`silent` 不触发 onChange）。 */
  function onFieldInput(): void {
    if (mdField && mdField.value !== editor.getMarkdown()) {
      editor.setMarkdown(mdField.value, { silent: true });
    }
  }

  const doc = form.ownerDocument;
  doc.addEventListener("submit", onSubmitCapture, true);
  mdField?.addEventListener("input", onFieldInput);

  // 初次填充：未改动就保存时，服务端才拿得到 html（否则「空 html」= JS 没跑，一律拒收）
  sync();

  return {
    sync,
    destroy(): void {
      doc.removeEventListener("submit", onSubmitCapture, true);
      mdField?.removeEventListener("input", onFieldInput);
    },
  };
}
