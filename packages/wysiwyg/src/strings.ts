/**
 * 库**自有**文案（placeholder / 大纲标签 / 空段落占位）—— 运行时 `locale` 选项。
 *
 * edodo 内建文案（斜杠菜单 / 表格控件 / 块菜单…）**不在**这里：那是 `@xmsbl/quilldown-edodo`
 * 自己的字典（`src/core/i18n.ts`），由同名的 `locale` 选项切换。
 * 这里只管本包自有的这几个串，随时可换。
 */
export interface EditorStrings {
  /** 空文档占位（edodo 的 `data-placeholder`）。 */
  placeholder: string;
  /** 空段落的行内占位（CSS `content`，走变量 `--qd-block-placeholder`）。 */
  blockPlaceholder: string;
  /** 浮动大纲容器的 aria-label。 */
  tocLabel: string;
  /** 大纲里没有文字（只有标点 / 空标题）时的回退名。 */
  tocUntitled: string;
}

const EN: EditorStrings = {
  placeholder: "Write something, or type “/” for commands…",
  blockPlaceholder: "Type “/” for commands…",
  tocLabel: "Outline",
  tocUntitled: "Untitled heading",
};

const ZH: EditorStrings = {
  placeholder: "写点什么，或输入「/」唤出命令菜单…",
  blockPlaceholder: "输入「/」查看命令…",
  tocLabel: "大纲",
  tocUntitled: "未命名标题",
};

/** 内置 locale（键 = `EditorOptions.locale` 的取值）。 */
export const BUILTIN_STRINGS: Readonly<Record<string, EditorStrings>> = { en: EN, zh: ZH };

/** 解析最终文案：内置 locale → 未知 locale 回退 `en` → `strings` 逐字段覆盖。 */
export function resolveStrings(locale?: string, overrides?: Record<string, string>): EditorStrings {
  const base = (locale !== undefined ? BUILTIN_STRINGS[locale] : undefined) ?? EN;
  if (!overrides) return base;
  return {
    placeholder: overrides.placeholder ?? base.placeholder,
    blockPlaceholder: overrides.blockPlaceholder ?? base.blockPlaceholder,
    tocLabel: overrides.tocLabel ?? base.tocLabel,
    tocUntitled: overrides.tocUntitled ?? base.tocUntitled,
  };
}
