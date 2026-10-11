/**
 * 浮动大纲（Notion 式三态）：收起 = 右缘一列按级次变宽的短刻度；悬停 / 聚焦 = 刻度隐去、
 * 卡片滑出；高亮 = 按**滚动位置**算当前章节。
 *
 * 扫的是 **markdown 真相源**（不是编辑区 DOM）：跳过围栏代码块，标题里只有一 / 二 / 三级
 * 进大纲；一个标题都没有 → 整块 `hidden`。
 * 宿主只提供两样东西：`[data-editor-toc]`（容器）与 `data-editor-default-toc="1"`（默认开关）。
 */
import type { EditorStrings } from "./strings";

export interface TocHeading {
  level: number;
  text: string;
}

/** 大纲对应的编辑区块（edodo 顶层标题；类名 `ew-*` 是契约的一部分）。 */
const BLOCKS = ".ew-content > h1, .ew-content > h2, .ew-content > h3";

/** 扫 markdown 的一 / 二 / 三级标题（跳过围栏代码块，剥掉标题里的行内标记）。 */
export function scanHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  let fence: string | null = null;
  for (const line of markdown.split("\n")) {
    const fenceLine = /^\s{0,3}(`{3,}|~{3,})/.exec(line);
    if (fence) {
      if (fenceLine && fenceLine[1]?.[0] === fence) fence = null;
      continue;
    }
    if (fenceLine) {
      fence = fenceLine[1]?.[0] ?? null;
      continue;
    }
    const match = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    const level = match?.[1]?.length ?? 4;
    if (!match || level > 3) continue;
    headings.push({ level, text: stripInline(match[2] ?? "") });
  }
  return headings;
}

/** 标题文案里的行内标记（图片 / 链接 / 强调 / 行内代码）。 */
export function stripInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_~`]/g, "")
    .trim();
}

export interface TocOptions {
  /** `[data-editor-toc]` 容器 */
  panel: HTMLElement;
  /** 滚动容器（= 挂载点） */
  canvas: HTMLElement;
  strings: EditorStrings;
}

export interface TocHandle {
  /** 正文变了重扫标题（签名没变则跳过重建，别每敲一个字都重建 DOM）。 */
  update(markdown: string): void;
  destroy(): void;
}

export function setupToc({ panel, canvas, strings }: TocOptions): TocHandle {
  panel.setAttribute("aria-label", strings.tocLabel);

  const ticks = document.createElement("div");
  ticks.className = "editor-toc-ticks";
  const card = document.createElement("div");
  card.className = "editor-toc-card";
  panel.replaceChildren(ticks, card);
  panel.hidden = true;

  const state = {
    headings: [] as TocHeading[],
    signature: "",
    blocks: [] as Element[],
    active: -1,
    tickEls: [] as HTMLButtonElement[],
    rowEls: [] as HTMLButtonElement[],
  };

  let raf = 0;
  const schedule = (): void => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      sync();
    });
  };
  canvas.addEventListener("scroll", schedule, { passive: true });

  function render(): void {
    const empty = state.headings.length === 0;
    panel.hidden = empty;
    if (empty) {
      ticks.replaceChildren();
      card.replaceChildren();
      state.tickEls = [];
      state.rowEls = [];
      state.blocks = [];
      return;
    }

    const tickEls: HTMLButtonElement[] = [];
    const rowEls: HTMLButtonElement[] = [];
    state.headings.forEach((heading, index) => {
      const label = heading.text || strings.tocUntitled;

      const tick = document.createElement("button");
      tick.type = "button";
      tick.className = "editor-toc-tick";
      tick.dataset.level = String(heading.level);
      tick.title = label;
      tick.setAttribute("aria-label", label);
      tick.addEventListener("click", () => jump(index));

      const row = document.createElement("button");
      row.type = "button";
      row.className = "editor-toc-row";
      row.dataset.level = String(heading.level);
      row.textContent = label;
      row.addEventListener("click", () => jump(index));

      tickEls.push(tick);
      rowEls.push(row);
    });

    ticks.replaceChildren(...tickEls);
    card.replaceChildren(...rowEls);
    state.tickEls = tickEls;
    state.rowEls = rowEls;
    state.blocks = [...canvas.querySelectorAll(BLOCKS)];
  }

  /** 点刻度 / 条目 → 滚到对应标题块（两边顺序一致：都是 ATX 标题）。 */
  function jump(index: number): void {
    const target = state.blocks[index];
    if (target instanceof HTMLElement)
      target.scrollIntoView({ block: "start", behavior: "smooth" });
    setActive(index);
  }

  function setActive(index: number): void {
    if (index === state.active) return;
    state.active = index;
    state.tickEls.forEach((el, i) => el.classList.toggle("is-active", i === index));
    state.rowEls.forEach((el, i) => el.classList.toggle("is-active", i === index));
    revealActive();
  }

  /** 卡片里让高亮项留在可视区 —— 只动卡片自己的 `scrollTop`（不碰画布滚动）。 */
  function revealActive(): void {
    const row = state.rowEls[state.active];
    if (!row) return;
    const bottom = row.offsetTop + row.offsetHeight;
    if (row.offsetTop < card.scrollTop) card.scrollTop = row.offsetTop;
    else if (bottom > card.scrollTop + card.clientHeight)
      card.scrollTop = bottom - card.clientHeight;
  }

  /** 滚动高亮：画布上缘往下约 1/4（至少 48px）这条线之上、最后一个标题 = 当前章节。 */
  function sync(): void {
    if (panel.hidden) return;
    const box = canvas.getBoundingClientRect();
    const line = box.top + Math.max(48, box.height * 0.22);
    let index = -1;
    for (const [i, block] of state.blocks.entries()) {
      if (block.getBoundingClientRect().top <= line) index = i;
      else break;
    }
    setActive(index);
  }

  return {
    update(markdown: string): void {
      const headings = scanHeadings(markdown);
      const signature = headings
        .map((heading) => `${heading.level}\u0000${heading.text}`)
        .join("\u0001");
      if (signature === state.signature) return;
      state.signature = signature;
      state.headings = headings;
      state.active = -1; // 新 DOM 没有 is-active，复位后由 sync 重算
      render();
      sync();
    },
    destroy(): void {
      canvas.removeEventListener("scroll", schedule);
      if (raf) cancelAnimationFrame(raf);
      panel.replaceChildren();
      panel.hidden = true;
      state.blocks = [];
      state.tickEls = [];
      state.rowEls = [];
    },
  };
}
