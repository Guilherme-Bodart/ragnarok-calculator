import { describe, expect, it } from "vitest";
import type { CalculatorModifierEffects } from "./calculator-modifier-effects";
import { CastTimingEngine } from "./cast-timing";
import type { RoSkill } from "./ro-types";

const emptyModifierEffects: CalculatorModifierEffects = {
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
  flatDefense: 0,
  flatMagicDefense: 0,
  pAtk: 0,
  smatk: 0,
  atkRate: 0,
  shortAttackRate: 0,
  longAttackRate: 0,
  matkRate: 0,
  maxHp: 0,
  maxHpRate: 0,
  maxSp: 0,
  maxSpRate: 0,
  maxAp: 0,
  maxApRate: 0,
  hit: 0,
  flee: 0,
  crit: 0,
  criticalDamageRate: 0,
  healPower: 0,
  aspd: 0,
  aspdRate: 0,
  variableCastRate: 0,
  fixedCastRate: 0,
  fixedCast: 0,
  afterCastDelayRate: 0,
  skillVariableCastRate: {},
  skillFixedCastRate: {},
  skillFixedCast: {},
  raceDamageRate: {},
  elementDamageRate: {},
  sizeDamageRate: {},
  skillDamageRate: {},
  magicRaceDamageRate: {},
  magicElementDamageRate: {},
  magicSizeDamageRate: {},
  classDamageRate: {},
  magicClassDamageRate: {},
  magicElementAttackRate: {},
  ignoreDefenseRate: {},
  ignoreMagicDefenseRate: {},
  incomingRaceDamageReductionRate: {},
  incomingElementDamageReductionRate: {},
  incomingClassDamageReductionRate: {},
  unsupportedStatements: [],
};

const skill: RoSkill = {
  id: "WZ_STORMGUST",
  name: "Storm Gust",
  classTree: "wizard",
  damageType: "magical",
  maxLevel: 10,
  hitCount: 1,
  variableCastMsByLevel: { "10": 4000 },
  fixedCastMsByLevel: { "10": 1000 },
  afterCastDelayMsByLevel: { "10": 500 },
  cooldownMsByLevel: { "10": 2000 },
  baseMultiplierByLevel: { "10": 100 },
  source: "manual",
};

describe("CastTimingEngine", () => {
  const engine = new CastTimingEngine();

  it("applies global and skill-specific cast modifiers", () => {
    const result = engine.calculate({
      skill,
      skillLevel: 10,
      modifierEffects: {
        ...emptyModifierEffects,
        variableCastRate: -25,
        fixedCastRate: -10,
        fixedCast: -100,
        afterCastDelayRate: -20,
        skillVariableCastRate: { WZ_STORMGUST: -25 },
        skillFixedCastRate: { WZ_STORMGUST: -10 },
        skillFixedCast: { WZ_STORMGUST: -100 },
      },
    });

    expect(result).toMatchObject({
      baseVariableCastMs: 4000,
      variableCastMs: 2000,
      baseFixedCastMs: 1000,
      fixedCastMs: 600,
      baseAfterCastDelayMs: 500,
      afterCastDelayMs: 400,
      cooldownMs: 2000,
      cycleTimeMs: 4600,
    });
  });

  it("keeps instant skills at zero cycle time", () => {
    const instantSkill: RoSkill = {
      ...skill,
      variableCastMsByLevel: undefined,
      fixedCastMsByLevel: undefined,
      afterCastDelayMsByLevel: undefined,
      cooldownMsByLevel: undefined,
    };

    expect(
      engine.calculate({
        skill: instantSkill,
        skillLevel: 10,
        modifierEffects: emptyModifierEffects,
      }).cycleTimeMs,
    ).toBe(0);
  });
});
