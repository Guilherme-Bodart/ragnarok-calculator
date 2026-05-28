import { describe, expect, it } from "vitest";
import { getHardDefMultiplier, getHardMdefMultiplier } from "./defense";

describe("defense formulas", () => {
  it("uses Renewal hard DEF reduction", () => {
    expect(getHardDefMultiplier(0)).toBe(1);
    expect(getHardDefMultiplier(500)).toBe(0.5);
    expect(getHardDefMultiplier(275)).toBeCloseTo(0.633333, 6);
  });

  it("uses Renewal hard MDEF reduction", () => {
    expect(getHardMdefMultiplier(0)).toBe(1);
    expect(getHardMdefMultiplier(125)).toBe(0.5);
    expect(getHardMdefMultiplier(60)).toBe(0.6625);
  });
});
