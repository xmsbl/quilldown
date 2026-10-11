/**
 * 标题锚点。
 * 保留 Unicode 字母 / 数字 → 中文标题也有可读锚点（`#时间口径`），ASCII 转小写、去标点、空白转 `-`。
 * 全空（标题只有标点 / 表情）时回退 `section` —— 与迁移前的落库 HTML 保持一致。
 */

export function slugify(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]+/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** 每份文档一个实例：同名标题依次追加 `-1` / `-2` …（id 必须文档内唯一） */
export function createSlugger(): (text: string) => string {
  const seen = new Map<string, number>();

  return (text) => {
    const base = slugify(text) || "section";
    const count = seen.get(base);
    seen.set(base, (count ?? 0) + 1);

    return count === undefined ? base : `${base}-${count}`;
  };
}
