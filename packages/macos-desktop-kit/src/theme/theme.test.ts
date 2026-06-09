import { describe, expect, it } from "vitest";

import { isThemeMode, isThemePalette, resolveEffectiveTheme } from "./theme";

describe("theme helpers", () => {
  it("validates stored theme modes", () => {
    expect(isThemeMode("system")).toBe(true);
    expect(isThemeMode("light")).toBe(true);
    expect(isThemeMode("dark")).toBe(true);
    expect(isThemeMode("sepia")).toBe(false);
  });

  it("validates stored theme palettes", () => {
    expect(isThemePalette("blue")).toBe(true);
    expect(isThemePalette("green")).toBe(true);
    expect(isThemePalette("rose")).toBe(true);
    expect(isThemePalette("orange")).toBe(false);
  });

  it("resolves system theme preference", () => {
    expect(resolveEffectiveTheme("system", true)).toBe("dark");
    expect(resolveEffectiveTheme("system", false)).toBe("light");
    expect(resolveEffectiveTheme("light", true)).toBe("light");
    expect(resolveEffectiveTheme("dark", false)).toBe("dark");
  });
});
