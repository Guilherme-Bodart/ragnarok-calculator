import { describe, expect, it } from "vitest";
import {
  evaluateStatusPointBudget,
  getRegularStatCost,
  getRegularStatusPointsForBaseLevel,
  getTraitStatusPointsForBaseLevel,
} from "./status-points";
import type { CharacterStats } from "../ro-types";

const emptyStats: CharacterStats = {
  str: 1,
  agi: 1,
  vit: 1,
  int: 1,
  dex: 1,
  luk: 1,
  pow: 0,
  sta: 0,
  wis: 0,
  spl: 0,
  con: 0,
  crt: 0,
};

describe("status point budget", () => {
  it("matches rAthena regular status point totals", () => {
    expect(getRegularStatusPointsForBaseLevel(1)).toBe(48);
    expect(getRegularStatusPointsForBaseLevel(99)).toBe(1273);
    expect(getRegularStatusPointsForBaseLevel(200)).toBe(4099);
    expect(getRegularStatusPointsForBaseLevel(260)).toBe(4099);
  });

  it("matches rAthena trait point totals", () => {
    expect(getTraitStatusPointsForBaseLevel(200)).toBe(0);
    expect(getTraitStatusPointsForBaseLevel(250)).toBe(190);
    expect(getTraitStatusPointsForBaseLevel(260)).toBe(228);
  });

  it("uses Renewal regular stat costs", () => {
    expect(getRegularStatCost(1)).toBe(0);
    expect(getRegularStatCost(10)).toBe(18);
    expect(getRegularStatCost(100)).toBe(639);
    expect(getRegularStatCost(130)).toBe(1419);
  });

  it("adds transcendent and fourth job change points to the budget", () => {
    const budget = evaluateStatusPointBudget({
      baseLevel: 260,
      isTranscendent: true,
      stats: emptyStats,
    });

    expect(budget.regular.available).toBe(4151);
    expect(budget.trait.available).toBe(235);
  });

  it("flags over-budget or over-cap stats", () => {
    const budget = evaluateStatusPointBudget({
      baseLevel: 260,
      isTranscendent: true,
      stats: {
        ...emptyStats,
        str: 131,
        pow: 236,
      },
    });

    expect(budget.regular.isValid).toBe(false);
    expect(budget.regular.overMaxStats).toEqual(["str"]);
    expect(budget.trait.isValid).toBe(false);
    expect(budget.trait.overMaxStats).toEqual(["pow"]);
  });
});
