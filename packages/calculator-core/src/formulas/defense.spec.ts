import { describe, expect, it } from "vitest";
import {
  getDefenseMultiplier,
  getHardDefMultiplier,
  getHardMdefMultiplier,
} from "./defense";

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

  it("applies defense ignore before hard DEF/MDEF reduction", () => {
    const monster = {
      id: 1,
      name: "Def Test",
      level: 1,
      race: "demihuman" as const,
      size: "medium" as const,
      element: "neutral" as const,
      elementLevel: 1,
      defense: 500,
      magicDefense: 125,
      hp: 1,
      source: "manual" as const,
    };

    expect(getDefenseMultiplier(monster, "physical", 50)).toBeCloseTo(
      getHardDefMultiplier(250),
      6,
    );
    expect(getDefenseMultiplier(monster, "magical", 100)).toBe(1);
  });
});
