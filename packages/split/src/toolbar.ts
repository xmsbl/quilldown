/**
 * 工具条动作 —— 全部作用在**原生 `<textarea>`** 上（分屏的左栏就是它）。
 *
 * 为什么不用 CodeMirror（ByteMD 是 CodeMirror）：那要打进一份编辑器内核（体积 + 它自己的一套
 * 主题 / 快捷键 / IME 处理），而我们要的只是「选中 → 包一层」这点事；原生的撤销栈、输入法、
 * 拖放、拼写检查还都是白送的。
 *
 * 一条纪律：**改值走 `execCommand("insertText")`，它进浏览器原生撤销栈**；`setRangeText` 只是
 * 兜底（它不发 `input`，撤销栈也不认 → 得手补一次 `input`，右侧预览才跟得上）。
 */
import type { SplitStrings } from "./strings.js";

/** 把 `[start, end)` 换成 `text`（`execCommand` 成功时浏览器自己会补 `input`）。 */
export function replaceRange(
  src: HTMLTextAreaElement,
  start: number,
  end: number,
  text: string,
): void {
  // focus 可能把插入点挪到末尾 → 先还原选区再插
  src.focus();
  src.setSelectionRange(start, end);

  let ok = false;
  try {
    ok = src.ownerDocument.execCommand("insertText", false, text);
  } catch {
    ok = false;
  }

  if (ok) return;

  src.setRangeText(text, start, end, "end");
  // setRangeText 不发 input 事件 → 补一次，右侧预览才会跟着动
  src.dispatchEvent(new Event("input", { bubbles: true }));
}

/** 选中 `[start, end)`：插完占位文本后把它选上，用户直接打字就能覆盖。 */
export function selectRange(src: HTMLTextAreaElement, start: number, end: number): void {
  src.focus();
  src.setSelectionRange(start, end);
}

/** 两侧包装（加粗 / 斜体 / 行内代码）：包住选区；没选区就插占位文字并选中它。 */
export function wrapSelection(src: HTMLTextAreaElement, token: string, placeholder: string): void {
  const start = src.selectionStart;
  const end = src.selectionEnd;
  const selected = src.value.slice(start, end);
  const inner = selected || placeholder;

  replaceRange(src, start, end, token + inner + token);

  if (selected) {
    const caret = start + token.length * 2 + inner.length;
    selectRange(src, caret, caret);
  } else {
    selectRange(src, start + token.length, start + token.length + inner.length);
  }
}

/** 行首前缀（标题 / 引用 / 列表）：选中的每一行各加一次；没选区就作用于光标所在行。 */
export function prefixLines(src: HTMLTextAreaElement, prefix: string, placeholder: string): void {
  const start = src.selectionStart;
  const end = src.selectionEnd;

  const from = src.value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const breakAt = src.value.indexOf("\n", end);
  const to = breakAt === -1 ? src.value.length : breakAt;

  const block = src.value.slice(from, to);
  const inner = block || placeholder;
  const text = inner
    .split("\n")
    .map((line) => prefix + line)
    .join("\n");

  replaceRange(src, from, to, text);

  if (block) {
    const caret = from + text.length;
    selectRange(src, caret, caret);
  } else {
    selectRange(src, from + prefix.length, from + prefix.length + inner.length);
  }
}

/**
 * 链接 `[文字](https://)`：有选区时选中的字就是链接文字（光标停在 `https://` 上等粘贴）；
 * 没选区就插占位文字并选中它。
 */
export function insertLink(src: HTMLTextAreaElement, placeholder: string): void {
  const start = src.selectionStart;
  const end = src.selectionEnd;
  const selected = src.value.slice(start, end);
  const label = selected || placeholder;
  const url = "https://";

  replaceRange(src, start, end, `[${label}](${url})`);

  if (selected) {
    const caret = start + 1 + label.length + 2 + url.length;
    selectRange(src, caret, caret);
  } else {
    selectRange(src, start + 1, start + 1 + label.length);
  }
}

/** 图片 `![说明](url)`：插到光标处（工具条上传 / 面板点图都走这里）。 */
export function insertImage(src: HTMLTextAreaElement, url: string, alt: string): void {
  const start = src.selectionStart;
  const end = src.selectionEnd;
  const text = `![${alt}](${url})`;

  replaceRange(src, start, end, text);
  const caret = start + text.length;
  selectRange(src, caret, caret);
}

/** 图片骨架 `![说明](https://)`：没配 `upload` 时用（url 选中，直接粘贴就替掉）。 */
export function insertImageTemplate(src: HTMLTextAreaElement, placeholder: string): void {
  const start = src.selectionStart;
  const end = src.selectionEnd;
  const url = "https://";
  const text = `![${placeholder}](${url})`;

  replaceRange(src, start, end, text);
  // `![` + 说明 + `](` 之后就是 url 起点
  const from = start + 2 + placeholder.length + 2;
  selectRange(src, from, from + url.length);
}

/** 代码块：包住选区（没选区就插骨架并把光标放到空行上）。 */
export function insertCodeBlock(src: HTMLTextAreaElement): void {
  const start = src.selectionStart;
  const end = src.selectionEnd;
  const selected = src.value.slice(start, end);

  replaceRange(src, start, end, "```\n" + selected + "\n```");
  const caret = start + 4 + selected.length;
  selectRange(src, caret, caret);
}

/** 块级模板（分割线）：前后补空行，避免与相邻段落粘连。 */
export function insertBlock(src: HTMLTextAreaElement, template: string): void {
  const start = src.selectionStart;
  replaceRange(src, start, src.selectionEnd, template);
  const caret = start + template.length;
  selectRange(src, caret, caret);
}

/** 一个工具条动作：`icon` 是 `icons.ts` 的名字；`apply` 只动 textarea（不碰 DOM / 状态）。 */
export interface ToolbarAction {
  id: string;
  icon: string;
  title(strings: SplitStrings): string;
  apply(src: HTMLTextAreaElement, strings: SplitStrings): void;
}

/** 动作清单（顺序即工具栏顺序）—— 与 ByteMD 的默认动作集对齐。 */
export const TOOLBAR_ACTIONS: readonly ToolbarAction[] = [
  {
    id: "bold",
    icon: "bold",
    title: (s) => s.bold,
    apply: (src, s) => wrapSelection(src, "**", s.boldText),
  },
  {
    id: "italic",
    icon: "italic",
    title: (s) => s.italic,
    apply: (src, s) => wrapSelection(src, "*", s.italicText),
  },
  {
    id: "quote",
    icon: "quote",
    title: (s) => s.quote,
    apply: (src, s) => prefixLines(src, "> ", s.quotedText),
  },
  {
    id: "code",
    icon: "code",
    title: (s) => s.code,
    apply: (src, s) => wrapSelection(src, "`", s.codeText),
  },
  {
    id: "codeBlock",
    icon: "codeBlock",
    title: (s) => s.codeBlock,
    apply: (src) => insertCodeBlock(src),
  },
  {
    id: "link",
    icon: "link",
    title: (s) => s.link,
    apply: (src, s) => insertLink(src, s.linkText),
  },
  {
    id: "image",
    icon: "image",
    // `upload` 没配时插骨架；配了由 create 接管（文件选择 → 上传 → insertImage）
    title: (s) => s.image,
    apply: (src, s) => insertImageTemplate(src, s.imageAlt),
  },
  {
    id: "ul",
    icon: "ul",
    title: (s) => s.ul,
    apply: (src, s) => prefixLines(src, "- ", s.ulItem),
  },
  {
    id: "ol",
    icon: "ol",
    title: (s) => s.ol,
    apply: (src, s) => prefixLines(src, "1. ", s.olItem),
  },
  {
    id: "hr",
    icon: "hr",
    title: (s) => s.hr,
    apply: (src) => insertBlock(src, "\n\n---\n\n"),
  },
];
