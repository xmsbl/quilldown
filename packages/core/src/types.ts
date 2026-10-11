/**
 * 契约 v1 的共享类型（`CONTRACT.md` §2）。
 * 编辑器包（wysiwyg / split）与宿主都对这些名字编程 —— 改动等于改契约。
 */

/** 宿主注入的图片上传回调（库不认端点 / 防伪令牌）。 */
export type UploadFn = (file: File) => Promise<{ url: string; name?: string }>;

/** md → html 的唯一出口签名（默认实现 = 本包的 {@link renderHtml}）。 */
export type RenderHtml = (md: string) => string;

/** 表单适配器写的两个字段（隐藏 textarea / input）。 */
export type FormField = HTMLInputElement | HTMLTextAreaElement;

/** 覆盖适配器的查找结果（缺省按 CONTRACT §3 的标记自动找；传 `null` = 明确不要该字段）。 */
export interface FormBindOptions {
  form?: HTMLFormElement | null;
  mdField?: FormField | null;
  htmlField?: FormField | null;
}

export interface EditorOptions {
  /** 初始 markdown */
  value?: string;
  /** 库自有文案的语言（`'en'` / `'zh'` …） */
  locale?: string;
  /** 覆盖库自有文案 */
  strings?: Record<string, string>;
  placeholder?: string;
  autofocus?: boolean;
  upload?: UploadFn;
  /** 覆盖渲染管线（默认走 core） */
  renderHtml?: RenderHtml;
  onChange?: (md: string, html: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
  tocDefault?: boolean;
  focusDefault?: boolean;
  /** 表单适配器（CONTRACT §4）：省略 = 自动找字段；`false` = 关；对象 = 覆盖查找。 */
  mirror?: boolean | FormBindOptions;
  // 编辑器特定选项（wysiwyg 的 layout / toolbar 等）由各自包 `extends EditorOptions`，
  // 不开索引签名 —— 拼错的选项名会静默失效，那正是要避免的那类 bug。
}

export interface EditorInstance {
  getMarkdown(): string;
  getHtml(): string;
  setMarkdown(md: string, opts?: { silent?: boolean }): void;
  isDirty(): boolean;
  focus(): void;
  destroy(): void;
}

/** 编辑器包导出的工厂签名（`create(mount, opts?)`）。 */
export interface EditorCreate {
  (mount: HTMLElement, opts?: EditorOptions): EditorInstance;
}
