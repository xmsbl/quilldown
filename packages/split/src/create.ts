/**
 * `create(mount, opts)` —— 契约 §2 的工厂（分屏：源码 + 预览 + 滚动同步）。
 *
 * 与 `@quilldown/wysiwyg` 同一份契约、同一条产出管线（CONTRACT §1）：
 * 库只产出 markdown，**落库 HTML 恒由 `@quilldown/core` 的 `renderHtml` 产出** ——
 * 所以两款编辑器的 `getHtml()` 逐字节一致，宿主只需要一套 sanitize。
 *
 * 左栏 = 原生 `<textarea>`（不是 CodeMirror）：撤销栈 / 输入法 / 拖放 / 拼写检查都是浏览器白送的，
 * 换来的代价是「没有语法高亮」—— 分屏那栏本来就是拿来看 markdown 源码的。
 *
 * DOM 形状（样式同目录 `index.css`，宿主只给 `[data-editor-mount]`）：
 *   .editor-split[data-qd-mode][data-qd-tab]
 *     ├ .editor-split-toolbar（动作钮 + 标题下拉 + 页签）
 *     └ .editor-split-panes
 *         ├ .editor-split-write   → textarea.editor-split-source
 *         └ .editor-split-preview → .editor-split-body（core 的 HTML；块上带 data-line-*）
 */
import { bindForm, renderDocument } from "@quilldown/core";
import type { EditorInstance, EditorOptions, FormBinding, LineAnchor } from "@quilldown/core";

import { createIcon } from "./icons";
import { createScrollSync, writeLineAnchors } from "./scroll-sync";
import { resolveStrings } from "./strings";
import { TOOLBAR_ACTIONS, insertImage, prefixLines, type ToolbarAction } from "./toolbar";

/** 预览刷新 + `onChange` 的去抖（= ByteMD 的 `previewDebounce` 默认值）。 */
const DEFAULT_DEBOUNCE_MS = 300;

/** `auto` 版式切到单栏的宽度阈值（窄栏里两栏各剩不到一行字，不如给页签）。 */
const DEFAULT_TAB_BREAKPOINT = 720;

export interface SplitOptions extends EditorOptions {
  /** 版式：`split` 双栏 · `tab` 单栏 + 写/预览页签 · `auto`（默认）= 窄于此阈值就单栏。 */
  mode?: "split" | "tab" | "auto";
  /** 工具条（默认开）。 */
  toolbar?: boolean;
  /** 预览刷新与 `onChange` 的去抖（毫秒）。 */
  changeDebounceMs?: number;
  /** `auto` 版式的宽度阈值（默认 720）。 */
  tabBreakpoint?: number;
}

export function create(mount: HTMLElement, options: SplitOptions = {}): EditorInstance {
  const doc = mount.ownerDocument;
  const win = doc.defaultView ?? window;
  const strings = resolveStrings(options.locale, options.strings);
  const debounceMs = options.changeDebounceMs ?? DEFAULT_DEBOUNCE_MS;
  const breakpoint = options.tabBreakpoint ?? DEFAULT_TAB_BREAKPOINT;
  const requestedMode = options.mode ?? "auto";
  const upload = options.upload;

  const initial = options.value ?? "";
  let markdown = initial;
  /** `html` 对应的 markdown；`null` = 还没算过（首次 `getHtml()` 必须真算，不能拿空串） */
  let htmlSource: string | null = null;
  let html = "";
  let anchors: LineAnchor[] = [];
  let dirty = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let mirror: FormBinding | null = null;
  let mode: "split" | "tab" = "split";
  let tab: "write" | "preview" = "write";
  let destroyed = false;

  const div = (className: string): HTMLDivElement => {
    const node = doc.createElement("div");
    node.className = className;
    return node;
  };

  // ─── DOM ────────────────────────────────────────────────────────────────────
  const root = div("editor-split");

  const toolbar = div("editor-split-toolbar");
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", strings.toolbarLabel);

  const source = doc.createElement("textarea");
  source.className = "editor-split-source";
  source.spellcheck = false;
  source.value = initial;
  source.placeholder = options.placeholder ?? strings.placeholder;
  source.setAttribute("aria-label", strings.write);

  const fileInput = upload ? doc.createElement("input") : null;
  if (fileInput) {
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.className = "editor-split-upload";
    fileInput.hidden = true;
  }

  /** 标题 = 下拉（ByteMD 是弹出菜单）；原生 select 免掉一套「点外部关」的状态机。 */
  const heading = doc.createElement("select");
  heading.className = "editor-split-heading";
  heading.setAttribute("aria-label", strings.heading);
  const headingPlaceholder = doc.createElement("option");
  headingPlaceholder.value = "";
  headingPlaceholder.textContent = strings.heading;
  headingPlaceholder.disabled = true;
  headingPlaceholder.selected = true;
  heading.appendChild(headingPlaceholder);
  for (let level = 1; level <= 6; level++) {
    const option = doc.createElement("option");
    option.value = String(level);
    option.textContent = `${strings.heading} ${level}`;
    heading.appendChild(option);
  }

  const tabs = div("editor-split-tabs");
  for (const [id, label] of [
    ["write", strings.write],
    ["preview", strings.preview],
  ] as const) {
    const button = doc.createElement("button");
    button.type = "button";
    button.className = "editor-split-tab";
    button.dataset.qdTab = id;
    button.textContent = label;
    button.addEventListener("click", () => {
      tab = id;
      applyMode();
    });
    tabs.appendChild(button);
  }

  const panes = div("editor-split-panes");
  const writePane = div("editor-split-pane editor-split-write");
  const previewPane = div("editor-split-pane editor-split-preview");
  const body = div("editor-split-body");
  const empty = doc.createElement("p");
  empty.className = "editor-split-empty";
  empty.textContent = strings.empty;

  writePane.appendChild(source);
  previewPane.appendChild(body);
  previewPane.appendChild(empty);
  panes.appendChild(writePane);
  panes.appendChild(previewPane);

  toolbar.appendChild(heading);
  for (const action of TOOLBAR_ACTIONS) {
    toolbar.appendChild(buildButton(action));
  }
  toolbar.appendChild(tabs);

  if (options.toolbar !== false) root.appendChild(toolbar);
  root.appendChild(panes);
  if (fileInput) root.appendChild(fileInput);
  mount.appendChild(root);

  // ─── 渲染（md 是真相源；HTML 只由 core 产出）────────────────────────────────
  const override = options.renderHtml;

  function compute(next: string): void {
    if (htmlSource === next) return;
    htmlSource = next;

    if (override) {
      // 宿主换了渲染器：HTML 听它的；行锚点仍按 core 口径取（结构不一样时同步退化，不报错）
      html = override(next);
      anchors = renderDocument(next).anchors;
      return;
    }
    const rendered = renderDocument(next);
    html = rendered.html;
    anchors = rendered.anchors;
  }

  function paint(): void {
    compute(markdown);
    body.innerHTML = html;
    writeLineAnchors(body, anchors); // 行号只进预览 DOM，**不进 HTML 产物**
    empty.hidden = markdown.trim() !== "";
    sync.refresh(); // 预览换了 DOM → 锚点全部作废
  }

  function flush(): void {
    timer = undefined;
    markdown = source.value;
    paint();
    updateDirty();
    mirror?.sync();
    options.onChange?.(markdown, html);
  }

  function schedule(): void {
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, debounceMs);
  }

  function updateDirty(): void {
    const next = markdown !== initial;
    if (next === dirty) return;
    dirty = next;
    options.onDirtyChange?.(next);
  }

  // ─── 工具条 ────────────────────────────────────────────────────────────────
  function buildButton(action: ToolbarAction): HTMLButtonElement {
    const button = doc.createElement("button");
    button.type = "button";
    button.className = "editor-split-btn";
    button.dataset.qdAction = action.id;
    const label = action.title(strings);
    button.title = label;
    button.setAttribute("aria-label", label);

    const icon = createIcon(doc, action.icon);
    if (icon) button.appendChild(icon);
    else button.textContent = label;

    button.addEventListener("click", () => {
      if (action.id === "image" && fileInput) {
        fileInput.click();
        return;
      }
      action.apply(source, strings);
    });
    return button;
  }

  if (fileInput) {
    const uploadImage = upload;
    if (uploadImage)
      fileInput.addEventListener("change", () => onPickImage(fileInput, uploadImage));
  }

  function onPickImage(input: HTMLInputElement, uploadImage: NonNullable<typeof upload>): void {
    const file = input.files?.[0];
    if (!file) return;

    void uploadImage(file)
      .then((result) => {
        insertImage(source, result.url, result.name ?? strings.imageAlt);
      })
      .catch(() => {
        /* 上传失败归宿主（它有 toast / 重试）；这里只是不插 */
      })
      .finally(() => {
        input.value = ""; // 同一个文件再选一次也要能触发 change
      });
  }

  heading.addEventListener("change", () => {
    const level = Number(heading.value);
    heading.value = "";
    if (level >= 1 && level <= 6) {
      prefixLines(source, `${"#".repeat(level)} `, strings.headingText);
    }
  });

  // ─── 版式 ──────────────────────────────────────────────────────────────────
  function resolveMode(): "split" | "tab" {
    if (requestedMode !== "auto") return requestedMode;
    const width = mount.clientWidth;
    // 量不出来（0 = 还没进版式 / 测试环境）→ 双栏；宁可两栏挤，也别猜成单栏
    return width > 0 && width < breakpoint ? "tab" : "split";
  }

  function applyMode(): void {
    mode = resolveMode();
    root.dataset.qdMode = mode;
    if (mode === "tab") root.dataset.qdTab = tab;
    else delete root.dataset.qdTab;

    for (const button of tabs.children) {
      button.classList.toggle("is-active", (button as HTMLElement).dataset.qdTab === tab);
    }
    sync.refresh(); // 隐藏态量出来的高度是 0 → 重算一次同步
  }

  /** `auto` 版式跟着挂载点宽度走（`ResizeObserver` 缺省时退化成「只在挂载时判一次」）。 */
  const observer =
    requestedMode === "auto" && typeof win.ResizeObserver === "function"
      ? new win.ResizeObserver(() => {
          const next = resolveMode();
          if (next !== mode) applyMode();
        })
      : null;

  // ─── 事件 ──────────────────────────────────────────────────────────────────
  source.addEventListener("input", schedule);
  const sync = createScrollSync(source, previewPane);

  applyMode();
  paint();
  observer?.observe(mount);

  const instance: EditorInstance = {
    getMarkdown: () => source.value,
    getHtml(): string {
      markdown = source.value;
      compute(markdown);
      return html;
    },
    setMarkdown(next: string, opts?: { silent?: boolean }): void {
      if (destroyed) return; // 卸载后不许再写宿主字段（回调也可能还握着实例）
      markdown = next;
      source.value = next;
      paint();
      updateDirty();
      if (opts?.silent === true) return; // 草稿回灌：`onChange` 不响（提交前由适配器兜底刷字段）
      mirror?.sync();
      options.onChange?.(next, html);
    },
    isDirty: () => dirty,
    focus: () => source.focus(),
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      if (timer) clearTimeout(timer);
      observer?.disconnect();
      sync.destroy();
      mirror?.destroy();
      mirror = null;
      root.remove();
    },
  };

  if (options.mirror !== false) {
    mirror = bindForm(instance, mount, typeof options.mirror === "object" ? options.mirror : {});
  }
  if (options.autofocus === true) source.focus();

  return instance;
}
