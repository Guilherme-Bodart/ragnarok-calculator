import { describe, expect, it } from "vitest";
import {
  calculatorStatRows,
  calculatorTraitStatRows,
  getCalculatorPresetStats,
  resolveNextCalculatorStats,
} from "./calculator-character-utils";

const baseStats = getCalculatorPresetStats("third", false).stats;

describe("calculator character utils", () => {
  it("returns fourth job trait stats only for fourth/max presets", () => {
    expect(getCalculatorPresetStats("third", false)).toMatchObject({
      baseLevel: 200,
      jobLevel: 70,
      stats: { pow: 0, con: 0 },
    });
    expect(getCalculatorPresetStats("max", true)).toMatchObject({
      baseLevel: 260,
      jobLevel: 55,
      stats: { pow: 80, con: 45 },
    });
  });

  it("clamps regular and trait stat input ranges", () => {
    const nextRegularStats = resolveNextCalculatorStats({
      baseLevel: 260,
      isFourthJob: true,
      rawValue: -10,
      stat: calculatorStatRows[0],
      stats: baseStats,
    });
    const nextTraitStats = resolveNextCalculatorStats({
      baseLevel: 260,
      isFourthJob: true,
      rawValue: 999,
      stat: calculatorTraitStatRows[0],
      stats: baseStats,
    });

    expect(nextRegularStats.str).toBe(1);
    expect(nextTraitStats.pow).toBe(110);
  });

  it("keeps the current stats when the point budget would be exceeded", () => {
    const nextStats = resolveNextCalculatorStats({
      baseLevel: 10,
      isFourthJob: false,
      rawValue: 130,
      stat: calculatorStatRows[0],
      stats: baseStats,
    });

    expect(nextStats).toBe(baseStats);
  });
});
