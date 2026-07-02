import { describe, it, expect } from "vitest";
import { mergeBuffEffects, type BuffEffect } from "./buff-effects";
import type { CalculatorModifierEffects } from "./calculator-modifier-effects";

describe("mergeBuffEffects", () => {
  const createEmptyModifiers = (): CalculatorModifierEffects => ({
    statBonuses: {
      str: 0,
      agi: 0,
      vit: 0,
      int: 0,
      dex: 0,
      luk: 0,
      pow: 0,
      sta: 0,
      wis: 0,
      spl: 0,
      con: 0,
      crt: 0,
    },
    flatAtk: 0,
    flatMatk: 0,
    atkRate: 0,
    matkRate: 0,
    pAtk: 0,
    smatk: 0,
    aspd: 0,
    aspdRate: 0,
    variableCastRate: 0,
    fixedCastRate: 0,
    fixedCast: 0,
    afterCastDelayRate: 0,
    hit: 0,
    flee: 0,
    crit: 0,
    criticalDamageRate: 0,
    healPower: 0,
    shortAttackRate: 0,
    longAttackRate: 0,
    maxHp: 0,
    maxHpRate: 0,
    maxSp: 0,
    maxSpRate: 0,
    raceDamageRate: {},
    elementDamageRate: {},
    sizeDamageRate: {},
    classDamageRate: {},
    magicRaceDamageRate: {},
    magicElementDamageRate: {},
    magicSizeDamageRate: {},
    magicClassDamageRate: {},
    skillDamageRate: {},
    ignoreDefenseRate: {},
    ignoreMagicDefenseRate: {},
    ignoreDefenseClassRate: {},
    ignoreMagicDefenseClassRate: {},
    incomingRaceDamageReductionRate: {},
  });

  it("should merge basic stat bonuses correctly", () => {
    const base = createEmptyModifiers();
    const buffs: BuffEffect[] = [
      { statBonuses: { str: 10, int: 10, dex: 10 } }, // Blessing
      { statBonuses: { agi: 12 } }, // Agi Up
    ];

    const result = mergeBuffEffects(base, buffs);

    expect(result.statBonuses.str).toBe(10);
    expect(result.statBonuses.int).toBe(10);
    expect(result.statBonuses.dex).toBe(10);
    expect(result.statBonuses.agi).toBe(12);
    expect(result.statBonuses.vit).toBe(0); // remains 0
  });

  it("should accumulate flat and rate stats correctly", () => {
    const base = createEmptyModifiers();
    base.flatAtk = 50;
    base.atkRate = 10;

    const buffs: BuffEffect[] = [
      { flatAtk: 20, atkRate: 5 },
      { flatAtk: 15, atkRate: 15 },
    ];

    const result = mergeBuffEffects(base, buffs);

    expect(result.flatAtk).toBe(85); // 50 + 20 + 15
    expect(result.atkRate).toBe(30); // 10 + 5 + 15
  });

  it("should apply EDP flag properly", () => {
    const base = createEmptyModifiers();

    expect(base.edpActive).toBeUndefined();

    const result = mergeBuffEffects(base, [{ edpActive: true }]);

    expect(result.edpActive).toBe(true);
  });

  it("should merge record properties (like raceDamageRate) by summing values", () => {
    const base = createEmptyModifiers();
    base.raceDamageRate = { brute: 10 };

    const buffs: BuffEffect[] = [
      { raceDamageRate: { brute: 5, plant: 20 } },
      { raceDamageRate: { plant: 5, demi_human: 15 } },
    ];

    const result = mergeBuffEffects(base, buffs);

    expect(result.raceDamageRate).toEqual({
      brute: 15, // 10 + 5
      plant: 25, // 20 + 5
      demi_human: 15, // 15
    });
  });

  it("should resolve weapon element by keeping the last buff's element", () => {
    const base = createEmptyModifiers();
    base.weaponElement = "neutral";

    const buffs: BuffEffect[] = [
      { weaponElement: "fire" }, // First endow
      { weaponElement: "water" }, // Second endow overrides
    ];

    const result = mergeBuffEffects(base, buffs);

    expect(result.weaponElement).toBe("water");
  });
});
