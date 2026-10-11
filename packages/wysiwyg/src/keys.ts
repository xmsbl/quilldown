/**
 * Tab 系增强 —— 引擎管不到的两处，只能在**捕获阶段**自管：
 *   · 代码块（`<pre>`）里的 Tab / Shift-Tab：引擎的 Tab 只有「列表缩进 / 表格换格」
 *     两种语义，落进 `<pre>` 就是跳走焦点；
 *   · 列表**顶层**的 Shift-Tab：引擎只在已经嵌套（父列表本身还在 `<li>` 里）时才反缩进，
 *     顶层直接返回 false，而引擎的处理器已经 `preventDefault` 了 → 表现为「按了没反应」。
 *
 * 挂捕获阶段的原因：edodo 的 `onKeyDown` 在 `.ew-content` 上（冒泡），祖先捕获先跑 →
 * `stopPropagation()` 后引擎那一套完全看不到。其余按键一律**直接放行**。
 * （走插件 keymap 不行：内置处理器先吃掉了 Shift-Tab，插件根本收不到。）
 */
export interface KeyBindOptions {
  /** 挂捕获监听的元素（= 挂载点，包住 `.ew-content`） */
  mount: HTMLElement;
  /** 代码块里按 Tab 插入的缩进（默认两个空格） */
  indent: string;
}

export function bindKeys({ mount, indent }: KeyBindOptions): () => void {
  const onKeyDown = (event: KeyboardEvent): void => {
    if (
      event.key !== "Tab" ||
      event.isComposing ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }
    if (!(event.target instanceof Node) || !mount.contains(event.target)) return; // 焦点在别处 → 别插手

    const code = codeBlockAt(window.getSelection());
    if (code && mount.contains(code)) {
      event.preventDefault();
      event.stopPropagation();
      if (event.shiftKey ? outdentLine(code) : insertAtCaret(indent)) notifyInput(code);
      return;
    }

    if (!event.shiftKey) return; // 列表缩进 / 表格换格归引擎

    const item = listItemAt(window.getSelection());
    if (!item || !mount.contains(item) || isNestedItem(item)) return; // 嵌套层归引擎

    event.preventDefault();
    event.stopPropagation();
    const paragraph = liftListItem(item);
    if (paragraph) notifyInput(paragraph);
  };

  mount.addEventListener("keydown", onKeyDown, true);
  return () => mount.removeEventListener("keydown", onKeyDown, true);
}

/** 光标所在列表项（`<li>`）；不在列表里 → null */
function listItemAt(selection: Selection | null): Element | null {
  return closestFromSelection(selection, "li");
}

/** 光标所在代码块（`<pre>`）；不在代码块里 → null */
function codeBlockAt(selection: Selection | null): Element | null {
  return closestFromSelection(selection, "pre");
}

function closestFromSelection(selection: Selection | null, selector: string): Element | null {
  if (!selection || selection.rangeCount === 0) return null;
  const node = selection.getRangeAt(0).startContainer;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);
  return el?.closest(selector) ?? null;
}

/** 已经在嵌套层（父列表本身也在 `<li>` 里）→ 反缩进交给引擎 */
function isNestedItem(item: Element): boolean {
  return item.parentElement?.parentElement?.tagName === "LI";
}

/**
 * 把一条**顶层**列表项提出列表变成段落（嵌在它里面的子列表原样跟在后面）；
 * 前后剩下的项各自成一段新列表，顺序不变。返回新段落（调用方用它落光标 + 派发 input）。
 */
function liftListItem(item: Element): HTMLElement | null {
  const list = item.parentElement;
  if (!list) return null;
  const items = [...list.children];
  const index = items.indexOf(item);
  if (index < 0) return null;

  const makeList = (nodes: Element[]): HTMLElement | null => {
    if (nodes.length === 0) return null;
    const clone = document.createElement(list.tagName.toLowerCase());
    for (const attribute of list.attributes) clone.setAttribute(attribute.name, attribute.value);
    clone.append(...nodes);
    return clone;
  };

  const nested = [...item.children].filter((el) => el.tagName === "UL" || el.tagName === "OL");
  const paragraph = document.createElement("p");
  paragraph.append(...[...item.childNodes].filter((node) => !nested.includes(node as Element)));

  list.after(
    ...[
      makeList(items.slice(0, index)),
      paragraph,
      ...nested,
      makeList(items.slice(index + 1)),
    ].filter((node): node is HTMLElement => node !== null),
  );
  list.remove();

  const range = document.createRange();
  range.selectNodeContents(paragraph);
  range.collapse(true);
  const selection = window.getSelection();
  if (selection) select(range, selection);
  return paragraph;
}

/** 在光标处插入文本（有选区先删）；光标落在插入内容之后 */
function insertAtCaret(text: string): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);

  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  select(range, selection);
  return true;
}

/**
 * 去掉光标所在行行首的一层缩进（一个 Tab 或最多两个空格）；行首没缩进就什么都不做。
 * ⚠ 行首只按「同一文本节点里上一个 `\n`」找 —— 代码块的行要么是文本里的 `\n`，
 *   要么由 `<br>` 分成独立文本节点（此时行首就是节点起点），两种情况都成立。
 */
function outdentLine(block: Element): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE || !block.contains(node)) return false;
  const data = (node as Text).data;

  const start = data.lastIndexOf("\n", range.startOffset - 1) + 1;
  const head = data.slice(start, range.startOffset);
  const width = head.startsWith("\t")
    ? 1
    : head.startsWith("  ")
      ? 2
      : head.startsWith(" ")
        ? 1
        : 0;
  if (width === 0) return false;

  (node as Text).deleteData(start, width);
  range.setStart(node, Math.max(start, range.startOffset - width));
  range.collapse(true);
  select(range, selection);
  return true;
}

function select(range: Range, selection: Selection): void {
  selection.removeAllRanges();
  selection.addRange(range);
}

/** 手工改完 DOM 补一个 input：引擎的 onInput 会更新占位符 / 记历史 / 触发 change */
function notifyInput(block: Element): void {
  block.dispatchEvent(new Event("input", { bubbles: true }));
}
