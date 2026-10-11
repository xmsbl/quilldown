/**
 * 契约的**可执行版**（CONTRACT §5）—— 分屏那一侧：挂载 + 打字 + 两栏同步滚动 +
 * 上传 mock + 两个表单字段被填 + 往返幂等。
 *
 * 与 `main.ts`（wysiwyg）**同一份宿主契约**：DOM 标记 + 注入回调各一份，字段镜像仍由库的
 * 表单适配器做（`mirror` 默认开）。两页并排放着，就是「一款编辑器换另一款，宿主这半不用动」的证明。
 */
import "@quilldown/split/index.css";

import { create } from "@quilldown/split";

import "./styles.css";

const root = document.querySelector<HTMLElement>("[data-editor-root]");
const mount = root?.querySelector<HTMLElement>("[data-editor-mount]");
if (!root || !mount) throw new Error("host-example: 缺 [data-editor-root] / [data-editor-mount]");

const mdField = root.querySelector<HTMLTextAreaElement>("[data-editor-md]");
const htmlField = root.querySelector<HTMLInputElement>("[data-editor-html]");
const stat = document.querySelector<HTMLElement>("#stat");
const fields = document.querySelector<HTMLElement>("#fields");
const dark = document.querySelector<HTMLInputElement>("#dark");
const roundTrip = document.querySelector<HTMLButtonElement>("#roundtrip");

/** 上传 mock：完全不连网 —— 回一个内联 SVG 的 data URL（走宿主的 `upload` 回调）。 */
function mockUpload(file: File): Promise<{ url: string; name?: string }> {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120">` +
    `<rect width="240" height="120" rx="8" fill="#0f766e"/>` +
    `<text x="14" y="66" fill="#fff" font-family="ui-sans-serif, system-ui" font-size="14">` +
    `${file.name}</text></svg>`;
  return new Promise((resolve) => {
    setTimeout(() => resolve({ url: `data:image/svg+xml,${encodeURIComponent(svg)}` }), 250);
  });
}

/** 够长，才看得出两栏是不是一起动（滚动同步靠的是块级行锚点）。 */
const initial = [
  "# Split editor",
  "",
  "左边写 markdown，右边立刻出 HTML —— **滚动任意一栏，另一栏跟着走**。",
  "预览与落库的 HTML 是**同一份**（都由 `@quilldown/core` 产出），所以保存时不会「预览好看、落库变形」。",
  "",
  "## 工具条",
  "",
  "上面那排按钮作用在选区上：加粗、斜体、引用、行内代码、代码块、链接、图片、两种列表、标题、分割线。",
  "没选中内容时会插一段占位文字并选中它，直接打字就替掉。",
  "",
  "> 引用块也是块级锚点：源文滚到这里，预览这一块就对齐到视口顶部。",
  "",
  "## 代码块",
  "",
  "```ts",
  "export function hello(name: string): string {",
  "  return `hi ${name}`;",
  "}",
  "```",
  "",
  "## 表格与任务列表",
  "",
  "| 能力 | 归属 |",
  "| --- | --- |",
  "| md → html | `@quilldown/core`（唯一产出者） |",
  "| 滚动同步 | `@quilldown/split` |",
  "| 字段镜像 | core 的表单适配器 |",
  "",
  "- [x] 两栏同步滚动",
  "- [x] 表单字段被填",
  "- [ ] 交给宿主的人眼验收",
  "",
  "## 继续往下写",
  "",
  "这一段之后的每一节都是同样的形状，用来把两侧都撑到能滚：写完源文滚到底，",
  "预览也应该到底。",
  "",
  "### 第 1 节",
  "",
  "段落一。行号映射按**视觉行号**算（textarea 会折行），窗口变窄、折行变了会自动重算。",
  "",
  "### 第 2 节",
  "",
  "段落二。映射锚点来自 core 渲染时给出的**每个顶级块在源文里的行区间**，所以不会因为",
  "中间夹了空行、链接定义或者原始 HTML 而整体错位。",
  "",
  "### 第 3 节",
  "",
  "段落三。嵌套块（列表项、引用里的段落）共享同一行，锚点先去重再插值。",
  "",
  "### 第 4 节",
  "",
  "段落四。折叠屏（`mode: auto`）下这两栏会变成页签 —— 把浏览器窗口收窄即可看到。",
  "",
  "### 第 5 节",
  "",
  "段落五。到这里两侧都足够长了。",
  "",
].join("\n");

function paint(dirty: boolean): void {
  if (stat) stat.textContent = `dirty: ${dirty ? "yes" : "no"}`;
}

function report(text: string): void {
  if (fields) fields.textContent = text;
}

/** 字段 = 编辑器当前值（`<input>` 的值按 HTML 规范不含换行，所以只比长度与取值）。 */
function fieldsMatch(): boolean {
  const md = mdField?.value ?? "";
  const html = htmlField?.value ?? "";
  return (
    md.length > 0 &&
    html.length > 0 &&
    md === editor.getMarkdown() &&
    html === editor.getHtml().replace(/\n/g, "")
  );
}

const editor = create(mount, {
  value: initial,
  locale: "en",
  mode: "auto",
  upload: mockUpload,
  onChange(next, rendered) {
    report(`${next.length} chars md → ${rendered.length} chars html`);
  },
  onDirtyChange: paint,
});

report(`${mdField?.value.length ?? 0} chars md → ${htmlField?.value.length ?? 0} chars html`);
paint(editor.isDirty());

dark?.addEventListener("change", () => {
  document.documentElement.classList.toggle("dark", dark.checked);
});

roundTrip?.addEventListener("click", () => {
  const before = editor.getMarkdown();
  editor.setMarkdown(before, { silent: true });
  report(
    editor.getMarkdown() === before
      ? "✓ round-trip: getMarkdown() is stable"
      : "✗ round-trip changed the markdown",
  );
});

document.querySelector<HTMLFormElement>("#shell")?.addEventListener("submit", (event) => {
  event.preventDefault();
  // 适配器在 document 捕获阶段就刷过字段 → 这里看到的应当就是编辑器当前值
  report(fieldsMatch() ? "✓ submit: both fields are filled" : "✗ submit: field mismatch");
});
