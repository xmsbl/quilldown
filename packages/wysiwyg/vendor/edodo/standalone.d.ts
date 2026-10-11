/**
 * edodo-write `dist-lib/standalone.js` 的**最小类型适配** —— 本地件，不是上游原件。
 *
 * 原件由 `scripts/vendor.mjs` 从 npm 入库（同目录 `standalone.js`）；上游的完整类型树
 * （`dist-lib/**\/*.d.ts`）**没有**一并 vendored：本库只触达 `EdodoWrite` 一个类，
 * 其余导出（插件工厂 / 解析纯函数）由 core 管线承担。
 * 这里只手写**我们实际用到**的成员；换上游版本时对照 `vendor/VERSION.json`。
 */
export type EdodoToolbar = boolean | "floating" | "fixed" | "none";

/** 插件 `on` 回调拿到的上下文（只用其 `root` / `dom.currentBlock`）。 */
export interface EdodoContext {
  root: HTMLElement;
  dom: { currentBlock(): HTMLElement | null };
}

export interface EdodoSelectionInfo {
  readonly empty: boolean;
  readonly collapsed: boolean;
}

export interface EdodoPlugin {
  name: string;
  priority?: number;
  on?: Partial<{
    change: (markdown: string, ctx: EdodoContext) => void;
    selection: (info: EdodoSelectionInfo | null, ctx: EdodoContext) => void;
  }>;
}

export interface EdodoEditorOptions {
  value?: string;
  placeholder?: string;
  autofocus?: boolean;
  readOnly?: boolean;
  toolbar?: EdodoToolbar;
  layout?: "page" | "fill";
  slashMenu?: boolean;
  spellcheck?: boolean;
  className?: string;
  ariaLabel?: string;
  onChange?: (markdown: string) => void;
  plugins?: EdodoPlugin[];
  exclude?: string[];
  uploadImage?: (file: File) => Promise<string | { src: string; alt?: string }>;
}

export declare class EdodoWrite {
  readonly host: HTMLElement;
  readonly content: HTMLElement;
  constructor(host: HTMLElement, options?: EdodoEditorOptions);
  getMarkdown(): string;
  setMarkdown(md: string, opts?: { silent?: boolean }): void;
  getHTML(): string;
  isEmpty(): boolean;
  focus(): void;
  blur(): void;
  insertText(text: string): boolean;
  on(event: "change" | "selection", handler: (...args: never[]) => void): () => void;
  destroy(): void;
}
