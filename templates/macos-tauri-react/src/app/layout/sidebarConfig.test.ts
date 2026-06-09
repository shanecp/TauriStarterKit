import { describe, expect, it } from "vitest";

import { clampSidebarWidth, type SidebarConfig } from "./sidebarConfig";

const config: SidebarConfig = {
  resizeMode: "resizable",
  defaultWidth: 280,
  minWidth: 220,
  maxWidth: 420,
};

describe("sidebar config", () => {
  it("clamps sidebar width to configured bounds", () => {
    expect(clampSidebarWidth(100, config)).toBe(220);
    expect(clampSidebarWidth(320, config)).toBe(320);
    expect(clampSidebarWidth(600, config)).toBe(420);
  });

  it("falls back to the default width for invalid values", () => {
    expect(clampSidebarWidth(Number.NaN, config)).toBe(280);
  });
});
