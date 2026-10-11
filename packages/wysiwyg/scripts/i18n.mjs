/**
 * 构建期 i18n 施加（edodo-write 没有 i18n 接口 → 只能对 bundle 做确定性字符串替换）。
 *
 * `locales/<lang>.tsv` = 制表符分隔的「`<原文>`\t`<译文>`」，`#` 开头是注释。
 * **全有或全无**：任一条目 0 命中即抛错（上游文案改名时构建失败，人立刻知道；
 * 少了这条，表现是"汉化悄悄失效"而构建依旧绿）。
 */
import { readFileSync } from "node:fs";

/** 读 TSV → `[原文, 译文, 行号]` 列表（跳过空行与注释）。 */
export function loadPairs(tsvPath) {
  const pairs = [];
  readFileSync(tsvPath, "utf8")
    .split("\n")
    .forEach((raw, index) => {
      const line = raw.replace(/\r$/, "");
      if (!line || line.startsWith("#")) return;
      const tab = line.indexOf("\t");
      if (tab < 0) throw new Error(`${tsvPath}:${index + 1}: 缺制表符分隔：${line}`);
      pairs.push([line.slice(0, tab), line.slice(tab + 1), index + 1]);
    });
  return pairs;
}

/** 对源码施加词条；返回新源码。命中数走 `stats`（供单测断言护栏没失效）。 */
export function applyPairs(code, pairs, label, stats = {}) {
  let text = code;
  const misses = [];
  for (const [from, to, line] of pairs) {
    const count = text.split(from).length - 1;
    if (count === 0) {
      misses.push(`${label}:${line} 未命中：${from}`);
      continue;
    }
    text = text.split(from).join(to);
    stats.replaced = (stats.replaced ?? 0) + count;
    stats.hits = (stats.hits ?? 0) + 1;
  }
  if (misses.length > 0) {
    throw new Error(
      `i18n 清单有 ${misses.length}/${pairs.length} 条不再命中（上游文案已变，请修清单）：\n${misses.join("\n")}`,
    );
  }
  return text;
}
