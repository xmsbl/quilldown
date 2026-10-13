/**
 * 两栏滚动同步。
 *
 * 三条实测结论，改代码前先看：
 *  ① **不能照抄 `markdown-it.github.io` 的「鼠标在谁身上谁驱动」** —— 那是互斥版；直接挂双向
 *     `scroll` 必然 ping-pong（两侧互推来回跳，表面看就是「完全不能用」）。正解 = **回声抑制**：
 *     程序滚动的那侧记下目标值，随之而来的 `scroll` 与记录值相符就丢弃它。
 *  ② **别用 rAF 动画逐帧改 `scrollTop`** —— 每帧都发事件，抑制压不住。
 *  ③ 锚点收成**严格递增**折线再插值：嵌套块共享同一行（`ul` 与首个 `li`、`blockquote` 与内层 `p`），
 *     不去重会让「按行切片」的索引整体错位 —— **不报错，只是乱跳**。
 *
 * 映射单位是**视觉行号**（textarea 会折行），所以要先按量尺把「源行号 → 视觉行号」算出来；
 * 量尺宽度取**内容盒**（少了 padding 会少算折行）。
 */
import type { LineAnchor } from "@xmsbl/quilldown-core";

/** 折线上的一个锚点：源文视觉行号 → 预览纵向偏移（px）。 */
export interface AnchorPoint {
  line: number;
  offset: number;
}

/**
 * 锚点 → 「视觉行号 → 预览偏移」查表（纯函数，可单测）。
 *
 * @param rows 预览里各块量出来的锚点（顺序随意）
 * @param visualLines 源侧折行后的总行数
 * @param endOffset 预览底部的偏移（=`scrollHeight`，兜住最后一个锚点之后的内容）
 */
export function interpolateMap(
  rows: readonly AnchorPoint[],
  visualLines: number,
  endOffset: number,
): Float64Array {
  const sorted = [...rows].sort((a, b) => a.line - b.line || a.offset - b.offset);

  // 严格递增：起点钉 0，同行只留第一个
  const points: AnchorPoint[] = [{ line: 0, offset: 0 }];
  for (const row of sorted) {
    if (row.line <= points[points.length - 1]!.line) continue;
    points.push({ ...row });
  }
  points.push({
    line: Math.max(visualLines, points[points.length - 1]!.line),
    offset: endOffset,
  });

  // 测量偶尔回退 → 拉平，保证单调不减
  for (let i = 1; i < points.length; i++) {
    if (points[i]!.offset < points[i - 1]!.offset) points[i]!.offset = points[i - 1]!.offset;
  }

  const map = new Float64Array(visualLines + 1);
  let index = 0;
  for (let line = 0; line <= visualLines; line++) {
    while (index < points.length - 2 && points[index + 1]!.line <= line) index++;
    const a = points[index]!;
    const b = points[index + 1]!;
    map[line] =
      b.line === a.line
        ? a.offset
        : a.offset + ((b.offset - a.offset) * (line - a.line)) / (b.line - a.line);
  }
  return map;
}

/** 顶级块标签 —— 与 core `renderDocument` 的锚点**逐位对齐**（元素型 token 的产物）。 */
const BLOCK_TAGS = /^(H[1-6]|P|UL|OL|BLOCKQUOTE|PRE|TABLE|HR)$/;

/**
 * 把 core 的行锚点写进预览的顶级块（`data-line-start` / `data-line-end`）。
 *
 * ⚠ 锚点**只进预览 DOM，不进 HTML 产物**（否则每个块都带 `data-line-*`，落库 HTML 就脏了）。
 * @returns 实际写了几块（与锚点数不一致 = 渲染器被宿主换过，映射会退化 —— 不报错）
 */
export function writeLineAnchors(container: Element, anchors: readonly LineAnchor[]): number {
  const blocks = Array.from(container.children).filter((el) => BLOCK_TAGS.test(el.tagName));
  const count = Math.min(blocks.length, anchors.length);

  for (let i = 0; i < count; i++) {
    const block = blocks[i]!;
    const anchor = anchors[i]!;
    block.setAttribute("data-line-start", String(anchor.line));
    block.setAttribute("data-line-end", String(anchor.endLine));
  }
  return count;
}

/** 同步句柄：预览换完 DOM / 切了版式后 `refresh()`；卸载时 `destroy()`。 */
export interface ScrollSync {
  refresh(): void;
  destroy(): void;
}

export function createScrollSync(source: HTMLTextAreaElement, preview: HTMLElement): ScrollSync {
  const doc = source.ownerDocument;
  const win = doc.defaultView ?? window;

  let map: Float64Array | null = null;
  let mapWidth = -1; // 建映射时的源控件宽度（变了 = 折行变了）
  let scheduled: "source" | "preview" | null = null;
  /** 「程序设过的位置」；吞掉一次回声后失效（null = 没有待吞的回声） */
  const setBy: { source: number | null; preview: number | null } = { source: null, preview: null };

  const lineHeight = (): number => parseFloat(win.getComputedStyle(source).lineHeight) || 20;

  function setScroll(el: HTMLElement, key: "source" | "preview", top: number): void {
    const max = Math.max(0, el.scrollHeight - el.clientHeight);
    const next = Math.max(0, Math.min(top, max));
    if (Math.abs(el.scrollTop - next) < 1) return; // 位置没变 = 不产生事件，也不留回声
    setBy[key] = next;
    el.scrollTop = next;
  }

  /** 回声判定必须在事件里**同步**做（进 rAF 时位置可能已被下一帧改写） */
  function isEcho(el: HTMLElement, key: "source" | "preview"): boolean {
    const mine = setBy[key];
    if (mine === null) return false;
    setBy[key] = null; // 一次程序赋值恰好换一个 scroll 事件
    return Math.abs(el.scrollTop - mine) < 2;
  }

  /** 重建映射（宽度变了 / 预览刚换完 DOM / 切过版式） */
  function build(): Float64Array {
    const cs = win.getComputedStyle(source);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);

    const meas = doc.createElement("div");
    Object.assign(meas.style, {
      position: "absolute",
      visibility: "hidden",
      height: "auto",
      width: `${Math.max(0, source.clientWidth - padX)}px`, // clientWidth 含内边距
      fontSize: cs.fontSize,
      fontFamily: cs.fontFamily,
      lineHeight: cs.lineHeight,
      whiteSpace: cs.whiteSpace,
      overflowWrap: "break-word",
    });
    doc.body.appendChild(meas);

    // 源行号 → 视觉行号（空行固定算一行；有内容的行按量出来的高度算折了几行）
    const starts: number[] = [];
    let visual = 0;
    for (const line of source.value.split("\n")) {
      starts.push(visual);
      if (line.length === 0) {
        visual++;
        continue;
      }
      meas.textContent = line;
      const mcs = win.getComputedStyle(meas);
      const height = parseFloat(mcs.height);
      const row = parseFloat(mcs.lineHeight) || lineHeight();
      visual += Math.max(1, Math.round(height / row));
    }
    meas.remove();

    const previewTop = preview.getBoundingClientRect().top;
    const rows: AnchorPoint[] = [];
    preview.querySelectorAll("[data-line-start]").forEach((el) => {
      const raw = el.getAttribute("data-line-start");
      if (!raw) return;
      const start = starts[Number(raw)];
      if (start === undefined) return;
      rows.push({
        line: start,
        offset: el.getBoundingClientRect().top - previewTop + preview.scrollTop,
      });
    });

    return interpolateMap(rows, visual, preview.scrollHeight);
  }

  /** 宽度变了（缩放 / 切版式）⇒ 折行变了，映射作废重算（不挂 resize 监听，免得分页累监听） */
  function ensureMap(): Float64Array {
    const width = source.clientWidth;
    if (!map || mapWidth !== width) {
      map = build();
      mapWidth = width;
    }
    return map;
  }

  function fromSource(): void {
    if (preview.scrollHeight - preview.clientHeight <= 0) return; // 版式隐藏 / 没内容
    const m = ensureMap();
    const index = Math.min(m.length - 1, Math.max(0, Math.floor(source.scrollTop / lineHeight())));
    setScroll(preview, "preview", m[index]!);
  }

  function fromPreview(): void {
    if (source.scrollHeight - source.clientHeight <= 0) return;
    const m = ensureMap();
    const top = preview.scrollTop;
    let line = 0;
    while (line < m.length - 1 && m[line + 1]! <= top) line++;
    setScroll(source, "source", lineHeight() * line);
  }

  function schedule(side: "source" | "preview"): void {
    if (scheduled === side) return;
    scheduled = side;
    const run = (): void => {
      const which = scheduled;
      scheduled = null;
      if (which === "source") fromSource();
      else if (which === "preview") fromPreview();
    };
    if (typeof win.requestAnimationFrame === "function") win.requestAnimationFrame(run);
    else win.setTimeout(run, 16);
  }

  /** 预览刚换完 DOM / 切了版式（隐藏态量出来的高度是 0）→ 映射作废，按源侧重算一次 */
  function refresh(): void {
    map = null;
    fromSource();
  }

  const onSource = (): void => {
    if (!isEcho(source, "source")) schedule("source");
  };
  const onPreview = (): void => {
    if (!isEcho(preview, "preview")) schedule("preview");
  };

  source.addEventListener("scroll", onSource, { passive: true });
  preview.addEventListener("scroll", onPreview, { passive: true });

  return {
    refresh,
    destroy(): void {
      source.removeEventListener("scroll", onSource);
      preview.removeEventListener("scroll", onPreview);
      map = null;
    },
  };
}
