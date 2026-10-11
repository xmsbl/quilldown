/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { bindForm, FORM_SELECTOR, HTML_FIELD_SELECTOR, MD_FIELD_SELECTOR } from "../src/index";
import type { EditorInstance } from "../src/index";

/**
 * 表单适配器的**契约面**测试（CONTRACT §3 / §4）。
 *
 * 这里用假编辑器（DOM 里跑不动 contenteditable）—— 适配器与编辑器实现无关，
 * 它只认 `getMarkdown` / `getHtml` / `setMarkdown` 三个方法。
 */
function makeEditor(initial = { md: "# hi", html: "<h1>hi</h1>" }) {
  const state = { ...initial };
  const setMarkdown = vi.fn((next: string) => {
    state.md = next;
  });
  const editor = {
    getMarkdown: () => state.md,
    getHtml: () => state.html,
    setMarkdown,
  } as unknown as EditorInstance;
  return { editor, state, setMarkdown };
}

/** 挂一棵「宿主那半」的标记；`attrs=false` 时只留 name 后缀（走回退链）。 */
function mountForm({ shellClass = true, attrs = true, fields = true } = {}) {
  const cls = shellClass ? 'class="editor-shell"' : "";
  const md = attrs ? "data-editor-md" : 'name="Form.BodyMd"';
  const html = attrs ? "data-editor-html" : 'name="Form.BodyHtml"';
  document.body.innerHTML = `
    <form id="f" ${cls}>
      <div data-editor-mount></div>
      ${fields ? `<textarea id="md" ${md}></textarea><input id="html" ${html} />` : ""}
    </form>`;
  return {
    form: document.querySelector<HTMLFormElement>("#f")!,
    mount: document.querySelector<HTMLElement>("[data-editor-mount]")!,
    mdField: document.querySelector<HTMLTextAreaElement>("#md"),
    htmlField: document.querySelector<HTMLInputElement>("#html"),
  };
}

function submit(form: HTMLFormElement): Event {
  const event = new Event("submit", { bubbles: true, cancelable: true });
  form.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("表单适配器（CONTRACT §3 / §4）", () => {
  it("冻结的选择器常量", () => {
    expect(FORM_SELECTOR).toBe("form.editor-shell");
    expect(MD_FIELD_SELECTOR).toBe("[data-editor-md]");
    expect(HTML_FIELD_SELECTOR).toBe("[data-editor-html]");
  });

  it("绑定即把当前 md / html 写进字段（未改动就保存也不会交空字段）", () => {
    const { mount, mdField, htmlField } = mountForm();
    const { editor } = makeEditor();

    const binding = bindForm(editor, mount);

    expect(binding).not.toBeNull();
    expect(mdField?.value).toBe("# hi");
    expect(htmlField?.value).toBe("<h1>hi</h1>");
  });

  it("sync() 重读编辑器（编辑过程中编辑器变了、字段还是旧值时的那一刷）", () => {
    const { mount } = mountForm();
    const { editor, state } = makeEditor();
    const binding = bindForm(editor, mount)!;

    state.md = "# changed";
    state.html = "<h1>changed</h1>";
    binding.sync();

    expect(document.querySelector<HTMLTextAreaElement>("#md")?.value).toBe("# changed");
    expect(document.querySelector<HTMLInputElement>("#html")?.value).toBe("<h1>changed</h1>");
  });

  it("提交事件在捕获阶段刷新字段（编辑器内建去抖没落盘也不丢）", () => {
    const { form, mount } = mountForm();
    const { editor, state } = makeEditor();
    bindForm(editor, mount);

    state.md = "# typed but not flushed";
    state.html = "<h1>typed but not flushed</h1>";
    const event = submit(form);

    expect(document.querySelector<HTMLTextAreaElement>("#md")?.value).toBe(state.md);
    expect(document.querySelector<HTMLInputElement>("#html")?.value).toBe(state.html);
    expect(event.defaultPrevented).toBe(false); // 适配器不拦提交
  });

  it("其它表单的提交不触发本适配器", () => {
    const { mount } = mountForm();
    const { editor, state } = makeEditor();
    bindForm(editor, mount);

    const other = document.createElement("form");
    document.body.append(other);
    state.md = "# untouched";
    submit(other);

    expect(document.querySelector<HTMLTextAreaElement>("#md")?.value).toBe("# hi");
  });

  it("字段 input → 回灌编辑器（silent），值相同时不重复灌", () => {
    const { mount, mdField } = mountForm();
    const { editor, setMarkdown } = makeEditor();
    bindForm(editor, mount);

    mdField!.value = "# restored draft";
    mdField!.dispatchEvent(new Event("input", { bubbles: true }));
    expect(setMarkdown).toHaveBeenCalledTimes(1);
    expect(setMarkdown).toHaveBeenCalledWith("# restored draft", { silent: true });

    mdField!.dispatchEvent(new Event("input", { bubbles: true })); // 同值再来一次 = 无动作
    expect(setMarkdown).toHaveBeenCalledTimes(1);
  });

  it("没有 data 属性时按 name 后缀认字段（Razor 的 Form. 前缀照样命中）", () => {
    const { mount, mdField, htmlField } = mountForm({ attrs: false });
    const { editor } = makeEditor();

    bindForm(editor, mount);

    expect(mdField?.value).toBe("# hi");
    expect(htmlField?.value).toBe("<h1>hi</h1>");
  });

  it("没有表单（或两个字段都没有）→ 返回 null，不报错", () => {
    const { editor } = makeEditor();

    document.body.innerHTML = `<div data-editor-mount></div>`;
    const bare = document.querySelector<HTMLElement>("[data-editor-mount]")!;
    expect(bindForm(editor, bare)).toBeNull();

    document.body.innerHTML = `<form class="editor-shell"><div data-editor-mount></div></form>`;
    const noFields = document.querySelector<HTMLElement>("[data-editor-mount]")!;
    expect(bindForm(editor, noFields)).toBeNull();
  });

  it("非 editor-shell 的表单仍能被最近的 form 命中（单表单页不用加类）", () => {
    const { mount, mdField } = mountForm({ shellClass: false });
    const { editor } = makeEditor();

    expect(bindForm(editor, mount)).not.toBeNull();
    expect(mdField?.value).toBe("# hi");
  });

  it("显式 form / 字段可覆盖查找（挂载点在表单外也能接）", () => {
    const { editor } = makeEditor();
    document.body.innerHTML = `
      <form id="real"><textarea id="md"></textarea></form>
      <div data-editor-mount></div>`;
    const mount = document.querySelector<HTMLElement>("[data-editor-mount]")!;
    const form = document.querySelector<HTMLFormElement>("#real")!;
    const mdField = document.querySelector<HTMLTextAreaElement>("#md")!;

    const binding = bindForm(editor, mount, { form, mdField });

    expect(binding).not.toBeNull();
    expect(mdField.value).toBe("# hi");
  });

  it("destroy() 之后 submit / input 都不再生效", () => {
    const { form, mount, mdField } = mountForm();
    const { editor, state, setMarkdown } = makeEditor();
    const binding = bindForm(editor, mount)!;

    binding.destroy();
    state.md = "# after destroy";
    submit(form);
    mdField!.dispatchEvent(new Event("input", { bubbles: true }));

    expect(document.querySelector<HTMLTextAreaElement>("#md")?.value).toBe("# hi");
    expect(setMarkdown).not.toHaveBeenCalled();
  });
});
