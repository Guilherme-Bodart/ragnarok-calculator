import { describe, expect, it } from "vitest";
import { AspdEngine } from "./aspd-engine";

describe("AspdEngine", () => {
  const engine = new AspdEngine();

  it("calculates ASPD from job, weapon, AGI and DEX", () => {
    expect(
      engine.calculate({
        classId: "Knight",
        weaponType: "twoHandSword",
        effectiveStats: {
          agi: 50,
          dex: 30,
        },
      }),
    ).toBe(161.18);
  });

  it("caps ASPD at 193", () => {
    expect(
      engine.calculate({
        classId: "Dragon_Knight",
        weaponType: "oneHandSword",
        effectiveStats: {
          agi: 200,
          dex: 200,
        },
        flatAspd: 20,
        aspdRate: 100,
      }),
    ).toBe(193);
  });
});
