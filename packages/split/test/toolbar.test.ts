/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";

import { createIcon, ICON_NAMES } from "../src/icons";
import { BUILTIN_STRINGS } from "../src/strings";
import { TOOLBAR_ACTIONS, insertLink, prefixLines, wrapSelection } from "../src/toolbar";

/**
 * 工具条动作都是**纯 textarea 操作**（选进 → 改值 → 定选区），所以能在 jsdom 里逐条焊住。
 *
 * ⚠ jsdom 没有 `execCommand` → 走的是 `setRangeText` 兜底分支，顺带把「兜底必须补
 * `input` 事件」这条也测了（漏了它 = 打字后右侧预览不动）。
 */
const strings = BUILTIN_STRINGS.en!;

let src: HTMLTextAreaElement;

beforeEach(() => {
  document.body.innerHTML = "<textarea></textarea>";
  src = document.querySelector("textarea")!;
});

function type(value: string, start?: number, end?: number): void {
  src.value = value;
  src.setSelectionRange(start ?? value.length, end ?? start ?? value.length);
}

describe("工具条动作", () => {
  it("加粗：没选区插占位词并选中它", () => {
    type("");
    wrapSelection(src, "**", strings.boldText);

    expect(src.value).toBe(`**${strings.boldText}**`);
    expect(src.selectionStart).toBe(2);
    expect(src.selectionEnd).toBe(2 + strings.boldText.length);
  });

  it("加粗：有选区就包住，光标落到末尾", () => {
    type("hello", 0, 5);
    wrapSelection(src, "**", strings.boldText);

    expect(src.value).toBe("**hello**");
    expect(src.selectionStart).toBe(9);
  });

  it("改值会补 `input` 事件（兜底分支不发事件的话预览不动）", () => {
    type("hi");
    let fired = 0;
    src.addEventListener("input", () => (fired += 1));

    wrapSelection(src, "*", strings.italicText);

    expect(fired).toBe(1);
  });

  it("行首前缀：选中的每一行各加一次", () => {
    type("一\n二\n三", 0, 5);
    prefixLines(src, "> ", strings.quotedText);

    expect(src.value).toBe("> 一\n> 二\n> 三");
  });

  it("行首前缀：没选区时作用于光标所在行", () => {
    type("上一行\n目标行\n下一行", 5);
    prefixLines(src, "- ", strings.ulItem);

    expect(src.value).toBe("上一行\n- 目标行\n下一行");
  });

  it("链接：没选区时插占位文字并选中它", () => {
    type("");
    insertLink(src, strings.linkText);

    expect(src.value).toBe(`[${strings.linkText}](https://)`);
    expect(src.value.slice(src.selectionStart, src.selectionEnd)).toBe(strings.linkText);
  });

  it("链接：有选区时选中的字当链接文字", () => {
    type("官网", 0, 2);
    insertLink(src, strings.linkText);

    expect(src.value).toBe("[官网](https://)");
  });

  it("列表 / 标题 / 分割线：每个动作都在没有选区时也产出合法 markdown", () => {
    type("");
    TOOLBAR_ACTIONS.find((a) => a.id === "ul")!.apply(src, strings);
    expect(src.value).toBe("- item");

    type("");
    TOOLBAR_ACTIONS.find((a) => a.id === "ol")!.apply(src, strings);
    expect(src.value).toBe("1. item");

    type("");
    TOOLBAR_ACTIONS.find((a) => a.id === "hr")!.apply(src, strings);
    expect(src.value.trim()).toBe("---");

    type("");
    prefixLines(src, "## ", strings.headingText);
    expect(src.value).toBe(`## ${strings.headingText}`);
  });

  it("代码块：包住选区并把光标放到空行上", () => {
    type("const x = 1;", 0, 12);
    TOOLBAR_ACTIONS.find((a) => a.id === "codeBlock")!.apply(src, strings);

    expect(src.value).toBe("```\nconst x = 1;\n```");
    expect(src.selectionStart).toBe(4 + 12);
  });

  it("图片：没配 upload 时插骨架（光标落在 url 上）", () => {
    type("");
    TOOLBAR_ACTIONS.find((a) => a.id === "image")!.apply(src, strings);

    expect(src.value).toBe(`![${strings.imageAlt}](https://)`);
    expect(src.value.slice(src.selectionStart, src.selectionEnd)).toBe("https://");
  });

  it("每个动作都配了图标，且图标名字在图标表里（拼错仅表现为空按钮，不报错）", () => {
    for (const action of TOOLBAR_ACTIONS) {
      expect(ICON_NAMES, action.id).toContain(action.icon);
      expect(createIcon(document, action.icon), action.id).not.toBeNull();
      expect(action.title(strings), action.id).not.toBe("");
    }
  });
});
