/**
 * `create(mount, opts)` —— 契约 §2 的工厂（所见即所得）。
 *
 * 分工（CONTRACT §1）：编辑器只产出 markdown；**落库 HTML 恒由 `@quilldown/core` 的
 * `renderHtml` 产出** —— 所以 `getHtml()` 与 split 逐个字节一致，宿主也只需一套 sanitize。
 * 库不持久化任何东西：草稿 / 防丢稿 / 提交拦截归宿主，这里只暴露 `isDirty()` + 事件。
 */
import { bindForm, renderHtml as coreRenderHtml } from "@quilldown/core";
import type {
  EditorInstance,
  EditorOptions,
  FormBinding,
  RenderHtml,
  UploadFn,
} from "@quilldown/core";

import { EdodoWrite } from "../vendor/edodo/standalone.js";
import type { EdodoContext, EdodoPlugin, EdodoSelectionInfo } from "../vendor/edodo/standalone.js";
import { bindKeys } from "./keys";
import { bindPlaceholder } from "./placeholder";
import { resolveStrings } from "./strings";
import { setupToc, type TocHandle } from "./toc";

/** 每次变更算 HTML 的去抖（edodo 内建 120ms 去抖已挡掉连打；这里再挡一层渲染成本）。 */
const DEFAULT_DEBOUNCE_MS = 300;

export interface WysiwygOptions extends EditorOptions {
  /** 文档版式：`page`（居中栏，默认）/ `fill`（撑满宿主，评论框用）。 */
  layout?: "page" | "fill";
  /** 选中工具条：`floating`（默认）/ `fixed` / `none`。 */
  toolbar?: "floating" | "fixed" | "none";
  /** `/` 斜杠菜单（默认开）。 */
  slashMenu?: boolean;
  /** 代码块里 Tab 的缩进（默认两个空格）。 */
  codeIndent?: string;
  changeDebounceMs?: number;
}

/** 光标所在块的标记插件（焦点模式的压暗锚点；`.is-current-block` 样式在本包 CSS）。 */
const currentBlockPlugin: EdodoPlugin = {
  name: "quilldown-current-block",
  priority: 100, // 先于核心预设（默认 0）
  on: {
    selection: (_info: EdodoSelectionInfo | null, ctx: EdodoContext) => markCurrentBlock(ctx),
    change: (_md: string, ctx: EdodoContext) => markCurrentBlock(ctx), // 回车新建块后可能不再触发 selection
  },
};

function markCurrentBlock(ctx: EdodoContext): void {
  const current = ctx.dom.currentBlock();
  for (const block of ctx.root.children) {
    block.classList.toggle("is-current-block", block === current);
  }
}

/** `UploadFn`（契约）→ edodo 的 `uploadImage`（只要 URL 字符串）。 */
function adaptUpload(upload: UploadFn | undefined) {
  if (!upload) return undefined;
  return (file: File): Promise<string> => upload(file).then((result) => result.url);
}

export function create(mount: HTMLElement, options: WysiwygOptions = {}): EditorInstance {
  const strings = resolveStrings(options.locale, options.strings);
  const renderHtml: RenderHtml = options.renderHtml ?? coreRenderHtml;
  const debounceMs = options.changeDebounceMs ?? DEFAULT_DEBOUNCE_MS;

  /** 默认开关与大纲容器的查找范围；缺省 = 挂载点的父元素（见 CONTRACT §3）。 */
  const root = mount.closest<HTMLElement>("[data-editor-root]") ?? mount.parentElement ?? mount;
  if (root.dataset.editorDefaultFocus === "1") mount.classList.add("is-focus");
  // 空段落占位是 CSS `content`（静态）→ 文案运行时从变量喂进去（见 styles.css）
  mount.style.setProperty("--qd-block-placeholder", JSON.stringify(strings.blockPlaceholder));

  let markdown = options.value ?? "";
  /** `html` 对应的 markdown；`null` = 还没算过（首次 `getHtml()` 必须真算，不能拿空串） */
  let htmlSource: string | null = null;
  let html = "";
  let dirty = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  /** 表单适配器（契约 §4）；默认开，找不到表单就静默不启用 */
  let mirror: FormBinding | null = null;

  const uploadImage = adaptUpload(options.upload);
  const editor = new EdodoWrite(mount, {
    value: markdown,
    layout: options.layout ?? "page",
    toolbar: options.toolbar ?? "floating",
    slashMenu: options.slashMenu ?? true,
    autofocus: options.autofocus === true,
    placeholder: options.placeholder ?? strings.placeholder,
    onChange: (next: string) => handleChange(next),
    plugins: [currentBlockPlugin],
    ...(uploadImage ? { uploadImage } : {}),
  });

  const panel = root.querySelector<HTMLElement>("[data-editor-toc]");
  const toc: TocHandle | null =
    panel && root.dataset.editorDefaultToc === "1"
      ? setupToc({ panel, canvas: mount, strings })
      : null;
  const unbindKeys = bindKeys({ mount, indent: options.codeIndent ?? "  " });
  const unbindPlaceholder = bindPlaceholder(mount);

  /** edodo 的 change（内建去抖）→ 再去抖算 HTML / 更新大纲 / 通知宿主 */
  function handleChange(next: string): void {
    markdown = next;
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, debounceMs);
  }

  function flush(): void {
    timer = undefined;
    htmlSource = markdown;
    html = renderHtml(markdown);
    toc?.update(markdown);
    updateDirty();
    mirror?.sync();
    options.onChange?.(markdown, html);
  }

  function updateDirty(): void {
    const next = markdown !== (options.value ?? "");
    if (next === dirty) return;
    dirty = next;
    options.onDirtyChange?.(next);
  }

  toc?.update(markdown);

  const instance: EditorInstance = {
    getMarkdown: () => editor.getMarkdown(),
    getHtml(): string {
      if (htmlSource !== markdown) {
        htmlSource = markdown;
        html = renderHtml(markdown);
      }
      return html;
    },
    setMarkdown(next: string, opts?: { silent?: boolean }): void {
      markdown = next;
      editor.setMarkdown(next, opts ?? {});
      updateDirty();
      if (opts?.silent !== true) handleChange(next);
    },
    isDirty: () => dirty,
    focus: () => editor.focus(),
    destroy(): void {
      if (timer) clearTimeout(timer);
      mirror?.destroy();
      unbindKeys();
      unbindPlaceholder();
      toc?.destroy();
      editor.destroy();
      mount.classList.remove("is-focus");
      mount.style.removeProperty("--qd-block-placeholder");
    },
  };

  if (options.mirror !== false) {
    mirror = bindForm(instance, mount, typeof options.mirror === "object" ? options.mirror : {});
  }

  return instance;
}
