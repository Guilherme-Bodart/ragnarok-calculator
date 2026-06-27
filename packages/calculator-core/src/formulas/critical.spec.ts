import { describe, expect, it } from "vitest";
import { CriticalEngine } from "./critical";
import type { CharacterStatus } from "../character-status-engine";
import type { CalculatorModifierEffects } from "../calculator-modifier-effects";

describe("CriticalEngine", () => {
  const engine = new CriticalEngine();

  const mockCharacter = {
    crit: 50,
    traitEffects: {
      criticalDamageRate: 0,
    },
  } as unknown as CharacterStatus;

  const mockModifiers = {} as CalculatorModifierEffects;

  it("calculates basic critical chance and damage", () => {
    const result = engine.calculate(mockCharacter, mockModifiers);

    expect(result.chance).toBe(50);
    expect(result.damageMultiplier).toBe(1.4);
  });

  it("bounds critical chance between 0 and 100", () => {
    const overCrit = { ...mockCharacter, crit: 150 } as CharacterStatus;
    const underCrit = { ...mockCharacter, crit: -10 } as CharacterStatus;

    expect(engine.calculate(overCrit, mockModifiers).chance).toBe(100);
    expect(engine.calculate(underCrit, mockModifiers).chance).toBe(0);
  });

  it("adds trait and modifier bonuses to critical damage multiplier", () => {
    const charWithTrait = {
      ...mockCharacter,
      traitEffects: { criticalDamageRate: 15 },
    } as CharacterStatus;

    const modWithBonus = {
      ...mockModifiers,
      criticalDamageRate: 25,
    } as CalculatorModifierEffects;

    const result = engine.calculate(charWithTrait, modWithBonus);

    // 1.4 + 15% + 25% = 1.4 + 0.40 = 1.8
    expect(result.damageMultiplier).toBeCloseTo(1.8);
  });
});
