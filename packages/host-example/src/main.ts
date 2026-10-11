/**
 * 契约的**可执行版**（CONTRACT §5）：挂载 + 打字 + 上传 mock + 两个表单字段被填 + 往返幂等。
 *
 * 宿主这半只写 DOM 标记与注入回调 —— **字段镜像由库的表单适配器做**（`mirror` 默认开，
 * 见 CONTRACT §4）；想自己接管就 `mirror: false` 改用 `getMarkdown()` / `getHtml()`。
 */
import "@xmsbl/quilldown-wysiwyg/index.css";

import { create } from "@xmsbl/quilldown-wysiwyg";

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

const initial = [
  "# Host example",
  "",
  "Type `/` for the slash menu · make a table · drop an image (mock upload) · toggle dark.",
  "",
  "## Field mirroring",
  "",
  "The two hidden fields are filled by the **library's form adapter** (`mirror` defaults on).",
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

function report(text: string): void {
  if (fields) fields.textContent = text;
}

/** 字段 = 编辑器当前值（提交时看到的形状，与宿主序列化的一模一样）。 */
function fieldsMatch(): boolean {
  const md = mdField?.value ?? "";
  const html = htmlField?.value ?? "";
  return (
    md.length > 0 && html.length > 0 && md === editor.getMarkdown() && html === editor.getHtml()
  );
}

const editor = create(mount, {
  value: initial,
  locale: "en",
  upload: mockUpload,
  // 字段镜像不归宿主：适配器写，宿主只在 onChange 里留个字数回显
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
