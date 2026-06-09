import { describe, expect, it } from "vitest";

import {
  DEFAULT_PAGINATION_SIZE,
  isPaginationSize,
  PAGINATION_SIZE_OPTIONS,
} from "./applicationSettings";

describe("application settings", () => {
  it("uses the requested default pagination size", () => {
    expect(DEFAULT_PAGINATION_SIZE).toBe(100);
  });

  it("validates selectable pagination sizes", () => {
    expect(PAGINATION_SIZE_OPTIONS).toEqual([10, 50, 100, 250, 500]);
    expect(isPaginationSize(50)).toBe(true);
    expect(isPaginationSize(25)).toBe(false);
    expect(isPaginationSize("100")).toBe(false);
  });
});
