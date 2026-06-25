import { describe, expect, it } from "vitest";
import { AspdEngine } from "./aspd-engine";

describe("AspdEngine", () => {
  const engine = new AspdEngine();

  it("calculates ASPD from job, weapon, AGI and DEX", () => {
    expect(
      engine.calculate({
        baseLevel: 99,
        classId: "Knight",
        weaponType: "twoHandSword",
        effectiveStats: {
          agi: 50,
          dex: 30,
        },
      }),
    ).toBe(156.7);
  });

  it("caps ASPD at 190 until base level 99", () => {
    expect(
      engine.calculate({
        baseLevel: 99,
        classId: "Dragon_Knight",
        weaponType: "oneHandSword",
        effectiveStats: {
          agi: 200,
          dex: 200,
        },
        flatAspd: 20,
        aspdRate: 100,
      }),
    ).toBe(190);
  });

  it("caps ASPD at 193 from base level 100 onward", () => {
    expect(
      engine.calculate({
        baseLevel: 200,
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
