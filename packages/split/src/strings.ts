/**
 * 库**自有**文案 —— 运行时 `locale` 选项（CONTRACT §2）。
 *
 * 键名照抄 ByteMD 的 locale 键（`bold` / `boldText` / `ulItem` …）：`title` 那半是按钮提示，
 * `*Text` / `*Item` 那半是**没有选中内容时**插进去的占位词。宿主换文案时按同一批键对号入座。
 *
 * 这里只有分屏自己的文案：预览正文是 core 渲染的、工具条图是内联 SVG，都没有内建英文。
 */
export interface SplitStrings {
  /** 工具条：加粗 / 斜体 / 引用 / 行内代码 / 代码块 */
  bold: string;
  boldText: string;
  italic: string;
  italicText: string;
  quote: string;
  quotedText: string;
  code: string;
  codeText: string;
  codeBlock: string;
  /** 链接 / 图片 */
  link: string;
  linkText: string;
  image: string;
  imageAlt: string;
  /** 无序 / 有序列表 */
  ul: string;
  ulItem: string;
  ol: string;
  olItem: string;
  /** 标题（下拉）与分割线 */
  heading: string;
  headingText: string;
  hr: string;
  /** 版式切换（`tab` 版式下的两颗页签） */
  write: string;
  preview: string;
  /** 输入框占位（`<textarea placeholder>`） */
  placeholder: string;
  /** 预览空态文案 */
  empty: string;
  /** 工具条容器的 aria-label */
  toolbarLabel: string;
}

const EN: SplitStrings = {
  bold: "Bold",
  boldText: "bold text",
  italic: "Italic",
  italicText: "italic text",
  quote: "Quote",
  quotedText: "quoted text",
  code: "Inline code",
  codeText: "code",
  codeBlock: "Code block",
  link: "Link",
  linkText: "link text",
  image: "Image",
  imageAlt: "alt",
  ul: "Unordered list",
  ulItem: "item",
  ol: "Ordered list",
  olItem: "item",
  heading: "Heading",
  headingText: "heading",
  hr: "Horizontal rule",
  write: "Write",
  preview: "Preview",
  placeholder: "Write something…",
  empty: "Preview appears here as you type.",
  toolbarLabel: "Formatting",
};

const ZH: SplitStrings = {
  bold: "加粗",
  boldText: "加粗文字",
  italic: "斜体",
  italicText: "斜体文字",
  quote: "引用",
  quotedText: "引用内容",
  code: "行内代码",
  codeText: "代码",
  codeBlock: "代码块",
  link: "链接",
  linkText: "链接文字",
  image: "图片",
  imageAlt: "说明",
  ul: "无序列表",
  ulItem: "条目",
  ol: "有序列表",
  olItem: "条目",
  heading: "标题",
  headingText: "标题",
  hr: "分割线",
  write: "编写",
  preview: "预览",
  placeholder: "写点什么…",
  empty: "输入内容后这里会显示预览。",
  toolbarLabel: "格式",
};

/** 内置 locale（键 = `EditorOptions.locale` 的取值）。 */
export const BUILTIN_STRINGS: Readonly<Record<string, SplitStrings>> = { en: EN, zh: ZH };

/** 解析最终文案：内置 locale → 未知 locale 回退 `en` → `strings` 逐键覆盖。 */
export function resolveStrings(locale?: string, overrides?: Record<string, string>): SplitStrings {
  const base = (locale !== undefined ? BUILTIN_STRINGS[locale] : undefined) ?? EN;
  return overrides ? { ...base, ...overrides } : base;
}
