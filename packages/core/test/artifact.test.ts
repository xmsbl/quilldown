import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * **产物**守卫：core 的 IIFE 现在是**薄转发** —— 管线走全局 `QuilldownRender`（外置），
 * 自己不打 marked / Prism。这里在「已经引了管线包」的沙箱里求值，验证：
 * ① 全局名固定 `QuilldownCore`；② 出口齐全且真的转发到管线；③ 体积仍是转发级。
 *
 * 需要先 `npm run build -w @xmsbl/quilldown-core`（根 CI 已把 build 排在 test 前）。
 */
const ARTIFACT = new URL("../dist/index.iife.js", import.meta.url);

describe("@xmsbl/quilldown-core 的 dist/index.iife.js", () => {
  it("薄转发：不含 marked / Prism 痕迹，体积在转发量级", () => {
    const source = readFileSync(ARTIFACT, "utf8");

    expect(source).toContain("var QuilldownCore");
    expect(source).toContain("QuilldownRender");
    expect(source).not.toContain("Prism");
    expect(source).not.toContain("walkTokens"); // marked 的内部符号
    expect(source.length).toBeLessThan(8_000);
  });

  it("在「已经引了管线」的沙箱里求值 → 出口齐全且转发到管线", () => {
    const source = readFileSync(ARTIFACT, "utf8");
    const scope = globalThis as unknown as Record<string, unknown>;
    const seen: string[] = [];

    scope.QuilldownRender = {
      renderHtml: (md: string) => {
        seen.push(`html:${md}`);
        return `<html>${md}</html>`;
      },
      renderDocument: (md: string) => {
        seen.push(`doc:${md}`);
        return { html: `<doc>${md}</doc>`, anchors: [] };
      },
      PRISM_LANGUAGES: ["markup"],
      prismGrammar: () => undefined,
    };

    const factory = new Function(`${source}; return QuilldownCore;`);
    const api = factory() as {
      CONTRACT_VERSION: string;
      renderHtml: (md: string) => string;
      renderDocument: (md: string) => { html: string };
      PRISM_LANGUAGES: readonly string[];
      bindForm: unknown;
      FORM_SELECTOR: string;
    };

    expect(api.CONTRACT_VERSION).toBe("2");
    expect(api.renderHtml("# x")).toContain("<html>");
    expect(api.renderDocument("# x").html).toContain("<doc>");
    expect([...api.PRISM_LANGUAGES]).toEqual(["markup"]);
    expect(typeof api.bindForm).toBe("function");
    expect(typeof api.FORM_SELECTOR).toBe("string");
    expect(seen).toEqual(["html:# x", "doc:# x"]);
  });
});
