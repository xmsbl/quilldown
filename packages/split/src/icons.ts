/**
 * 工具条图标 = **内联 SVG**（viewBox 20×20，描边走 `currentColor`）。
 *
 * 为什么不引图标字体 / 图标包：库要么自带一份（体积 + 许可 + 宿主没法改），要么要求宿主先引一份
 * （多一条静默依赖：忘了引 → 一排空白方框，不报错）。SVG 是唯一「自足且不该被换掉」的选项。
 * 图形都是几何基本形，宿主用 `--qd-*` 与 CSS 改观感即可。
 */

/** 动作名 → `<svg>` 的内容。键与 `toolbar.ts` 的动作一一对应。 */
const PATHS: Record<string, string> = {
  bold:
    '<path d="M6.5 4.2h4.4a2.8 2.8 0 0 1 0 5.6H6.5z"/>' +
    '<path d="M6.5 9.8h5.2a2.9 2.9 0 0 1 0 5.8H6.5z"/>',
  italic:
    '<line x1="9.6" y1="4.6" x2="15" y2="4.6"/>' +
    '<line x1="5" y1="15.4" x2="10.4" y2="15.4"/>' +
    '<line x1="12.2" y1="4.6" x2="7.8" y2="15.4"/>',
  quote:
    '<line x1="5.4" y1="4.5" x2="5.4" y2="15.5"/>' +
    '<line x1="9" y1="7" x2="15.4" y2="7"/>' +
    '<line x1="9" y1="10.5" x2="15.4" y2="10.5"/>' +
    '<line x1="9" y1="14" x2="13" y2="14"/>',
  code: '<polyline points="8.4 6 4.4 10 8.4 14"/>' + '<polyline points="11.6 6 15.6 10 11.6 14"/>',
  codeBlock:
    '<rect x="2.4" y="4" width="15.2" height="12" rx="2"/>' +
    '<polyline points="8.6 8 6.4 10 8.6 12"/>' +
    '<polyline points="11.4 8 13.6 10 11.4 12"/>',
  link:
    '<path d="M8.6 11.4 11.4 8.6"/>' +
    '<path d="M9.8 7.4 11.2 6a2.7 2.7 0 0 1 3.8 3.8l-1.4 1.4"/>' +
    '<path d="M10.2 12.6 8.8 14a2.7 2.7 0 0 1-3.8-3.8l1.4-1.4"/>',
  image:
    '<rect x="2.8" y="4.4" width="14.4" height="11.2" rx="2"/>' +
    '<circle cx="7.3" cy="8.3" r="1.3"/>' +
    '<path d="M4.4 14.6l3.9-3.6 2.7 2.5 2.3-2 2.3 2.3"/>',
  ul:
    '<circle cx="4.2" cy="7" r="1.3"/>' +
    '<circle cx="4.2" cy="13" r="1.3"/>' +
    '<line x1="8.4" y1="7" x2="16.4" y2="7"/>' +
    '<line x1="8.4" y1="13" x2="16.4" y2="13"/>',
  ol:
    '<text x="2.6" y="9" font-size="6.4">1</text>' +
    '<text x="2.6" y="15.6" font-size="6.4">2</text>' +
    '<line x1="8.4" y1="7" x2="16.4" y2="7"/>' +
    '<line x1="8.4" y1="13.6" x2="16.4" y2="13.6"/>',
  hr: '<line x1="3" y1="10" x2="17" y2="10"/>',
  write:
    '<path d="M4 16.2l.9-3.6 8.3-8.3 2.7 2.7-8.3 8.3z"/><line x1="12" y1="5.1" x2="14.7" y2="7.8"/>',
  preview:
    '<path d="M2.4 10S5.6 5.2 10 5.2 17.6 10 17.6 10 14.4 14.8 10 14.8 2.4 10 2.4 10z"/>' +
    '<circle cx="10" cy="10" r="2.3"/>',
};

/**
 * 造一个图标节点（`<svg>`）；名字不认识时返回 `null`（调用方自己决定要不要空位）。
 *
 * ⚠ 走「`<div>` 里 `innerHTML` 再取出来」这条路（HTML 解析器认得 `<svg>` 命名空间），
 * 别在 SVG 元素上直接写 `innerHTML` —— 那是 XML 解析口径，`<br>` 之类会炸。
 */
export function createIcon(doc: Document, name: string): SVGElement | null {
  const inner = PATHS[name];
  if (!inner) return null;

  const box = doc.createElement("div");
  box.innerHTML =
    `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" ` +
    `fill="none" stroke="currentColor" stroke-width="1.5" ` +
    `stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

  return box.firstElementChild as SVGElement | null;
}

/** 图标名字表（`toolbar.ts` 的动作清单用得到；顺带当一处白名单）。 */
export const ICON_NAMES = Object.keys(PATHS) as readonly string[];
