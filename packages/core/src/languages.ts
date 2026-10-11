import type { Grammar } from "prismjs";

import Prism from "./prism/index.js";

/**
 * 语言集**冻结**（护栏在 `test/languages.test.ts`：本表 === 实际加载到的语法）。
 * 与迁移前的 Inkwell `wwwroot/lib/prism/*` 13 个文件一一对应（宿主侧同名断言见 CONTRACT.md §6）。
 * 加语言 = 本表加名 + `src/prism/components.ts` 加 import，**同一批**改完（漏一边 = 代码块静默不高亮）。
 */
export const PRISM_LANGUAGES = [
  "markup",
  "css",
  "clike",
  "javascript",
  "typescript",
  "json",
  "bash",
  "python",
  "sql",
  "csharp",
  "yaml",
  "markdown",
  "diff",
] as const;

export type PrismLanguage = (typeof PRISM_LANGUAGES)[number];

/** 取语法（未收录 / 别名解析失败 → `undefined`，调用方回退纯转义；别名如 `ts` / `cs` / `yml` 由 Prism 自己登记） */
export function prismGrammar(language: string): Grammar | undefined {
  return Prism.languages[language];
}
