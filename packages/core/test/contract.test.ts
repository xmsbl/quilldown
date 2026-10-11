import { describe, expect, it } from "vitest";

import { CONTRACT_VERSION } from "../src/index";

describe("core", () => {
  it("exposes the frozen contract version", () => {
    expect(CONTRACT_VERSION).toBe("1");
  });
});
