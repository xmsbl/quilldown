/**
 * 契约的**可执行版**（CONTRACT §5）：挂载 + 打字 + 上传 mock + 两个表单字段被填。
 *
 * 这里刻意只写「宿主那半」：DOM 标记（`data-editor-root` / `data-editor-mount` /
 * `data-editor-toc` / `data-editor-md` / `data-editor-html`）+ 两个回调 + 上传 mock。
 * 字段镜像是宿主自己做的（库的便利适配器 E3 才发）—— 用来证明 `onChange(md, html)` 够用。
 */
import "@quilldown/wysiwyg/index.css";

import { create } from "@quilldown/wysiwyg";

import "./styles.css";

const root = document.querySelector<HTMLElement>("[data-editor-root]");
const mount = root?.querySelector<HTMLElement>("[data-editor-mount]");
if (!root || !mount) throw new Error("host-example: 缺 [data-editor-root] / [data-editor-mount]");

const mdField = root.querySelector<HTMLTextAreaElement>("[data-editor-md]");
const htmlField = root.querySelector<HTMLInputElement>("[data-editor-html]");
const stat = document.querySelector<HTMLElement>("#stat");
const fields = document.querySelector<HTMLElement>("#fields");
const dark = document.querySelector<HTMLInputElement>("#dark");

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

const initial = [
  "# Host example",
  "",
  "Type `/` for the slash menu · make a table · drop an image (mock upload) · toggle dark.",
  "",
  "## Field mirroring",
  "",
  "The two hidden fields are filled by the **host**, not the library.",
  "",
  "## Code block",
  "",
  "```ts",
  "export function hello(name: string): string {",
  "  return `hi ${name}`;",
  "}",
  "```",
  "",
].join("\n");

function paint(dirty: boolean): void {
  if (stat) stat.textContent = `dirty: ${dirty ? "yes" : "no"}`;
}

const editor = create(mount, {
  value: initial,
  locale: "en",
  upload: mockUpload,
  onChange(next, rendered) {
    if (mdField) mdField.value = next;
    if (htmlField) htmlField.value = rendered;
    if (fields) fields.textContent = `${next.length} chars md → ${rendered.length} chars html`;
  },
  onDirtyChange: paint,
});

// 首次填充由宿主决定（库不主动回调）
if (mdField) mdField.value = editor.getMarkdown();
if (htmlField) htmlField.value = editor.getHtml();
if (fields) {
  fields.textContent = `${mdField?.value.length ?? 0} chars md → ${htmlField?.value.length ?? 0} chars html`;
}
paint(editor.isDirty());

dark?.addEventListener("change", () => {
  document.documentElement.classList.toggle("dark", dark.checked);
});

document.querySelector<HTMLFormElement>("#shell")?.addEventListener("submit", (event) => {
  event.preventDefault();
});
