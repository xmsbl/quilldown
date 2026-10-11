import { describe, expect, it } from "vitest";

import { BUILTIN_STRINGS, resolveStrings } from "../src/index";

describe("库自有文案（运行时 locale）", () => {
  it("内置 en / zh", () => {
    expect(Object.keys(BUILTIN_STRINGS)).toEqual(["en", "zh"]);
  });

  it("未知 locale 回退 en（不抛错、不留空）", () => {
    expect(resolveStrings("fr").placeholder).toBe(BUILTIN_STRINGS.en?.placeholder);
    expect(resolveStrings(undefined).tocLabel).toBe("Outline");
  });

  it("zh 生效", () => {
    expect(resolveStrings("zh").tocLabel).toBe("大纲");
  });

  it("strings 覆盖逐字段生效（其余字段仍走内置）", () => {
    const strings = resolveStrings("zh", { placeholder: "自定义" });
    expect(strings.placeholder).toBe("自定义");
    expect(strings.tocLabel).toBe("大纲");
  });
});
