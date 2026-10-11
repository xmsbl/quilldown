/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { create } from "../src/index";

/**
 * 契约 §5 的可执行版冒烟（跑的是**真编辑器**，不再是假桩）。
 *
 * jsdom 里没有 contenteditable 的完整语义，但构造 / 取值 / 字段镜像这条链是纯 DOM 的，
 * 足够把「适配器写字段」「往返幂等」两个 DoD 焊进 CI（浏览器里的人眼验收仍归用户）。
 */
describe("wysiwyg 契约冒烟（真编辑器 + 表单适配器）", () => {
  function mountHost() {
    document.body.innerHTML = `
      <form class="editor-shell">
        <div data-editor-mount></div>
        <textarea data-editor-md></textarea>
        <input data-editor-html />
      </form>`;
    return {
      mount: document.querySelector<HTMLElement>("[data-editor-mount]")!,
      mdField: document.querySelector<HTMLTextAreaElement>("[data-editor-md]")!,
      htmlField: document.querySelector<HTMLInputElement>("[data-editor-html]")!,
    };
  }

  it("挂载即把 md / html 写进字段（未改动就保存也不会交空字段）", () => {
    const { mount, mdField, htmlField } = mountHost();
    const editor = create(mount, { value: "# hi\n\nbody" });

    expect(mdField.value).toBe("# hi\n\nbody");
    expect(htmlField.value).toContain("<h1");
    expect(htmlField.value).toContain("<p>body</p>");
    editor.destroy();
  });

  it("getMarkdown() 往返幂等（setMarkdown 回去不变形）", () => {
    const { mount } = mountHost();
    const source = "# hi\n\n- a\n- b\n\n```ts\nconst x = 1;\n```\n";
    const editor = create(mount, { value: source });

    const before = editor.getMarkdown();
    editor.setMarkdown(before, { silent: true });
    expect(editor.getMarkdown()).toBe(before);
    editor.destroy();
  });

  it("mirror:false 时字段一个字都不碰（宿主自己接管）", () => {
    const { mount, mdField, htmlField } = mountHost();
    const editor = create(mount, { value: "# hi", mirror: false });

    expect(mdField.value).toBe("");
    expect(htmlField.value).toBe("");
    editor.destroy();
  });

  it("destroy() 之后字段不再被写", () => {
    const { mount, mdField } = mountHost();
    const editor = create(mount, { value: "# hi" });

    editor.destroy();
    editor.setMarkdown("# after destroy");
    expect(mdField.value).toBe("# hi");
  });
});
