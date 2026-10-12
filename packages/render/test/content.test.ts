import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { PRISM_LANGUAGES, prismGrammar } from "../src/index.js";

/**
 * `content.css` 的语法高亮**覆盖率**守卫：
 * 我们只出「收录语言 grammar 里可能出现的 token 类」这一份精简主题（不是 Prism 全量主题）。
 * 一旦某条 grammar 引入了新的 token 类而 CSS 没跟上，代码块就静默掉色 —— 这条测试是那个静默失败的防线。
 */
const CSS = readFileSync(new URL("../src/content.css", import.meta.url), "utf8");
const NON_TOKEN_KEYS = new Set(["pattern", "lookbehind", "inside", "greedy"]);

function tokenClasses(): Set<string> {
  const names = new Set<string>();
  const walk = (grammar: unknown): void => {
    if (!grammar || typeof grammar !== "object" || Array.isArray(grammar)) {
      if (Array.isArray(grammar)) grammar.forEach(walk);
      return;
    }
    for (const [key, value] of Object.entries(grammar as Record<string, unknown>)) {
      if (key === "alias") {
        for (const alias of ([] as string[]).concat(value as string[])) {
          // `alias: "language-x"` 是给 `<code>` 的语言类，不是 token 类
          if (!alias.startsWith("language-")) names.add(alias);
        }
        continue;
      }
      if (NON_TOKEN_KEYS.has(key) || key.startsWith("_") || /^[A-Z]/.test(key)) continue;
      names.add(key);
      walk(value);
    }
  };
  for (const language of PRISM_LANGUAGES) walk(prismGrammar(language));
  return names;
}

describe("content.css 的语法高亮覆盖", () => {
  it("13 种 grammar 能产出的 token 类，CSS 里都有规则（少一类就红）", () => {
    const all = [...tokenClasses()].sort();
    expect(all.length).toBeGreaterThan(50); // 兜底：别让枚举退化成空集

    const missing = all.filter((name) => !new RegExp(`\\.token\\.${name}(?![\\w-])`).test(CSS));
    expect(missing).toEqual([]);
  });
});
