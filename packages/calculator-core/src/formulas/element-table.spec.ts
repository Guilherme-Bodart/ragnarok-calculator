import { describe, expect, it } from "vitest";
import { getElementMultiplier } from "./element-table";
import type { RoMonster, RoSkill } from "../ro-types";

const skill: RoSkill = {
  id: "MG_COLDBOLT",
  name: "Cold Bolt",
  classTree: "mage",
  damageType: "magical",
  element: "water",
  maxLevel: 10,
  hitCount: 10,
  baseMultiplierByLevel: { "10": 100 },
  source: "manual",
};

const monster: RoMonster = {
  id: 1,
  name: "Element Target",
  level: 1,
  race: "formless",
  size: "medium",
  element: "water",
  elementLevel: 1,
  defense: 0,
  magicDefense: 0,
  hp: 1,
  source: "manual",
};

describe("getElementMultiplier", () => {
  it("uses target element level for elemental reductions", () => {
    expect(getElementMultiplier(skill, monster)).toBe(0.25);
    expect(
      getElementMultiplier(skill, {
        ...monster,
        elementLevel: 2,
      }),
    ).toBe(0);
  });

  it("uses target element level for elemental advantages", () => {
    expect(
      getElementMultiplier(skill, {
        ...monster,
        element: "fire",
        elementLevel: 1,
      }),
    ).toBe(1.5);
    expect(
      getElementMultiplier(skill, {
        ...monster,
        element: "fire",
        elementLevel: 3,
      }),
    ).toBe(2);
  });

  it("clamps out-of-range element levels to the supported table", () => {
    expect(
      getElementMultiplier(skill, {
        ...monster,
        element: "fire",
        elementLevel: 99,
      }),
    ).toBe(2);
  });
});
