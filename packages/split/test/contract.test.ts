import { describe, expect, it } from "vitest";

import {
  BUILTIN_STRINGS,
  CONTRACT_VERSION,
  TOOLBAR_ACTIONS,
  create,
  resolveStrings,
} from "../src/index";

describe("split 包对 CONTRACT v1 的形状", () => {
  it("暴露冻结契约版本（与 core 同一个）", () => {
    expect(CONTRACT_VERSION).toBe("1");
  });

  it("工厂与库自有出口都在", () => {
    expect(typeof create).toBe("function");
    expect(typeof resolveStrings).toBe("function");
    expect(Array.isArray(TOOLBAR_ACTIONS)).toBe(true);
  });

  it("内置 locale 齐备，键两两对齐（换文案时不会漏一个键）", () => {
    const en = BUILTIN_STRINGS.en!;
    const zh = BUILTIN_STRINGS.zh!;

    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort());
    for (const [key, value] of Object.entries(en)) expect(value, key).not.toBe("");
  });

  it("文案解析：内置 → 未知回退 en → strings 逐键覆盖", () => {
    expect(resolveStrings("zh").bold).toBe(BUILTIN_STRINGS.zh!.bold);
    expect(resolveStrings("fr").bold).toBe(BUILTIN_STRINGS.en!.bold);
    expect(resolveStrings(undefined).bold).toBe(BUILTIN_STRINGS.en!.bold);
    expect(resolveStrings("zh", { bold: "B" }).bold).toBe("B");
    expect(resolveStrings("zh", { bold: "B" }).italic).toBe(BUILTIN_STRINGS.zh!.italic);
  });
});
