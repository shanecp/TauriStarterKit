import { describe, expect, it } from "vitest";

import { compactError } from "../format";

describe("refresh helper dependencies", () => {
  it("normalizes thrown errors for hook consumers", () => {
    expect(compactError(new Error("failed"))).toBe("failed");
    expect(compactError("failed")).toBe("failed");
    expect(compactError({})).toBe("Unexpected error");
  });
});
