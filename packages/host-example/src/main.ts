/**
 * 契约冒烟页入口。E0 只有骨架；E2 / E3 在这里挂真编辑器，并断言
 * `[data-editor-md]` / `[data-editor-html]` 被填、`getMarkdown()` 往返幂等。
 */
const root = document.querySelector<HTMLElement>("#host-example");

if (root) {
  root.textContent = "Quilldown host example — skeleton (editor wired in E2/E3).";
}
