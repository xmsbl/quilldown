import { describe, it, expect } from "vitest";

import { corePreset } from "@core/preset";
import { getLocale, localizePlugin, setLocale, t } from "@core/i18n";

/** 纯符号 / ASCII 标签：不做翻译（翻不翻都一样）。 */
const SYMBOLS = new Set(["B", "I", "S", "</>", "🔗", "H1", "H2", "❝", "•–", "1.", "{ }"]);

type Loose = Record<string, Array<Record<string, unknown>> | undefined>;

describe("i18n", () => {
  it("zh 字典覆盖 corePreset 的全部条目文案（漏一条即失败）", () => {
    setLocale("zh");
    const plugin = corePreset() as unknown as Loose;
    const missing: string[] = [];

    for (const key of ["slashItems", "toolbarItems", "blockMenuItems"]) {
      for (const item of plugin[key] ?? []) {
        for (const field of ["title", "hint", "group", "label", "busyText"]) {
          const value = item[field];
          if (typeof value !== "string" || SYMBOLS.has(value)) continue;
          if (t(value) === value) missing.push(value);
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it("en 保持英文，zh 生效，且 localizePlugin 真的施加到条目上", () => {
    setLocale("en");
    expect(getLocale()).toBe("en");
    const en = localizePlugin(corePreset());
    expect(en.slashItems?.some((item) => item.title === "Quote")).toBe(true);

    setLocale("zh");
    expect(getLocale()).toBe("zh");
    const zh = localizePlugin(corePreset());
    expect(zh.slashItems?.some((item) => item.title === "引用")).toBe(true);

    setLocale(undefined); // 复位，免得上游其它测试用例跟着中文
    expect(getLocale()).toBe("en");
  });
});
