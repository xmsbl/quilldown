/** @vitest-environment jsdom */
import { renderHtml } from "@xmsbl/quilldown-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { create } from "../src/index";

/**
 * 契约 §5 的可执行版冒烟（跑的是**真编辑器**）。
 *
 * jsdom 量不出布局（滚动同步的几何部分在这里是退化的），但「挂载 / 打字 → 预览换 DOM →
 * 字段被填 → 往返幂等」这条链是纯 DOM 的 —— 它正是 CONTRACT 里最容易静默漂移的那半。
 */
function mountHost() {
  document.body.innerHTML = `
    <form class="editor-shell">
      <div data-editor-root>
        <div data-editor-mount></div>
      </div>
      <textarea data-editor-md></textarea>
      <input data-editor-html />
    </form>`;

  return {
    mount: document.querySelector<HTMLElement>("[data-editor-mount]")!,
    mdField: document.querySelector<HTMLTextAreaElement>("[data-editor-md]")!,
    htmlField: document.querySelector<HTMLInputElement>("[data-editor-html]")!,
  };
}

const SOURCE = "# 标题\n\n正文一段\n\n```js\nconst x = 1;\n```\n";

/**
 * ⚠ 宿主用 `<input type="hidden">` 接 html 字段时，浏览器会**吃掉换行**
 * （HTML 规范：input 的值不许含 CR/LF）—— 对 HTML 语义没影响（块之间多不多一个换行无所谓），
 * 但断言不能拿它跟 `renderHtml()` 的原文相比。要逐字保真得用 `<textarea hidden>`。
 */
const asInputValue = (html: string): string => html.replace(/\n/g, "");

function sourceOf(mount: HTMLElement): HTMLTextAreaElement {
  return mount.querySelector<HTMLTextAreaElement>(".editor-split-source")!;
}

function previewOf(mount: HTMLElement): HTMLElement {
  return mount.querySelector<HTMLElement>(".editor-split-body")!;
}

function typeInto(mount: HTMLElement, value: string): void {
  const source = sourceOf(mount);
  source.value = value;
  source.dispatchEvent(new Event("input"));
}

afterEach(() => vi.useRealTimers());

describe("split 契约冒烟（真编辑器 + 表单适配器）", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("挂载即把 md / html 写进字段（未改动就保存也不会交空字段）", () => {
    const { mount, mdField, htmlField } = mountHost();
    const editor = create(mount, { value: SOURCE });

    expect(mdField.value).toBe(SOURCE);
    expect(htmlField.value).toContain("<h1");
    expect(htmlField.value).toBe(asInputValue(renderHtml(SOURCE)));
    editor.destroy();
  });

  it("两栏都在，且左栏初始内容 = value", () => {
    const { mount } = mountHost();
    const editor = create(mount, { value: SOURCE });

    expect(sourceOf(mount).value).toBe(SOURCE);
    expect(previewOf(mount).querySelector("h1")?.textContent).toBe("标题");
    editor.destroy();
  });

  it("左栏打字 → 去抖后预览换 DOM、块上带行锚点、字段跟上", () => {
    vi.useFakeTimers();
    const { mount, htmlField } = mountHost();
    const onChange = vi.fn();
    const editor = create(mount, { value: "", onChange });

    typeInto(mount, SOURCE);
    expect(onChange).not.toHaveBeenCalled(); // 去抖窗口里还没落盘

    vi.advanceTimersByTime(300);

    const blocks = Array.from(previewOf(mount).children);
    expect(blocks.map((el) => el.tagName)).toEqual(["H1", "P", "PRE"]);
    // 行锚点（滚动同步的锚）：标题在第 0 行、正文第 2 行、代码块第 4 行
    expect(blocks.map((el) => el.getAttribute("data-line-start"))).toEqual(["0", "2", "4"]);
    expect(onChange).toHaveBeenCalledWith(SOURCE, renderHtml(SOURCE));
    expect(htmlField.value).toBe(asInputValue(renderHtml(SOURCE)));
    editor.destroy();
  });

  it("getHtml() 与 wysiwyg 同源：就是 core.renderHtml（两编辑器产出逐字节一致）", () => {
    const { mount } = mountHost();
    const editor = create(mount, { value: SOURCE });

    expect(editor.getHtml()).toBe(renderHtml(SOURCE));
    editor.setMarkdown("# 换了\n");
    expect(editor.getHtml()).toBe(renderHtml("# 换了\n"));
    editor.destroy();
  });

  it("setMarkdown(silent) 只换内容，不喊 onChange（草稿回灌用）", () => {
    const { mount } = mountHost();
    const onChange = vi.fn();
    const editor = create(mount, { value: "", onChange });

    editor.setMarkdown(SOURCE, { silent: true });

    expect(editor.getMarkdown()).toBe(SOURCE);
    expect(previewOf(mount).querySelector("h1")).not.toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    editor.destroy();
  });

  it("isDirty() 跟着左栏走，destroy() 之后不再写字段", () => {
    const { mount, mdField } = mountHost();
    const editor = create(mount, { value: "初始" });

    expect(editor.isDirty()).toBe(false);
    editor.setMarkdown("改了");
    expect(editor.isDirty()).toBe(true);

    editor.destroy();
    editor.setMarkdown("destroy 之后");
    expect(mdField.value).toBe("改了");
  });

  it("mirror:false 时字段一个字都不碰（宿主自己接管）", () => {
    const { mount, mdField, htmlField } = mountHost();
    const editor = create(mount, { value: SOURCE, mirror: false });

    expect(mdField.value).toBe("");
    expect(htmlField.value).toBe("");
    editor.destroy();
  });

  it("mode:'tab' 出页签；点预览把左栏收起来（仍是同一个实例）", () => {
    const { mount, htmlField } = mountHost();
    const editor = create(mount, { value: SOURCE, mode: "tab" });
    const root = mount.querySelector<HTMLElement>(".editor-split")!;

    expect(root.dataset.qdMode).toBe("tab");
    expect(root.dataset.qdTab).toBe("write");

    const previewTab = mount.querySelector<HTMLElement>('[data-qd-tab="preview"]')!;
    previewTab.click();

    expect(root.dataset.qdTab).toBe("preview");
    expect(previewTab.classList.contains("is-active")).toBe(true);
    expect(htmlField.value).toBe(asInputValue(renderHtml(SOURCE))); // 换版式不动字段
    editor.destroy();
  });

  it("工具条关掉后不出工具条（宿主自备）", () => {
    const { mount } = mountHost();
    const editor = create(mount, { value: SOURCE, toolbar: false });

    expect(mount.querySelector(".editor-split-toolbar")).toBeNull();
    editor.destroy();
  });
});
