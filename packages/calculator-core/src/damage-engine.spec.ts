import { describe, expect, it } from "vitest";
import type { CalculatorModifierEffects } from "./calculator-modifier-effects";
import { DamageEngine } from "./damage-engine";
import { EffectiveCharacterBuilder } from "./effective-character";
import type { RoItem, RoMonster, RoSkill } from "./ro-types";

const monster: RoMonster = {
  id: 1001,
  name: "Training Target",
  level: 1,
  race: "demihuman",
  size: "medium",
  element: "neutral",
  elementLevel: 1,
  defense: 0,
  magicDefense: 0,
  hp: 1000,
  source: "manual",
};

const skill: RoSkill = {
  id: "SM_BASH",
  name: "Bash",
  classTree: "swordman",
  damageType: "physical",
  maxLevel: 10,
  hitCount: 1,
  baseMultiplierByLevel: { "10": 100 },
  source: "manual",
};

const emptyModifierEffects: CalculatorModifierEffects = {
  statBonuses: {
    str: 0,
    agi: 0,
    vit: 0,
    int: 0,
    dex: 0,
    luk: 0,
  },
  flatAtk: 0,
  flatMatk: 0,
  pAtk: 0,
  smatk: 0,
  atkRate: 0,
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
  aspd: 0,
  aspdRate: 0,
  raceDamageRate: {},
  elementDamageRate: {},
  sizeDamageRate: {},
  skillDamageRate: {},
  magicRaceDamageRate: {},
  magicElementDamageRate: {},
  magicSizeDamageRate: {},
  magicElementAttackRate: {},
  unsupportedStatements: [],
};

describe("DamageEngine", () => {
  const engine = new DamageEngine();
  const characterBuilder = new EffectiveCharacterBuilder();

  it("calculates prototype damage from normalized engine input", () => {
    const item: RoItem = {
      id: 1,
      name: "Test Sword",
      kind: "equipment",
      attack: 100,
      bonuses: [{ type: "atkRate", value: 10 }],
      source: "manual",
    };
    const character = characterBuilder.build(
      {
        baseLevel: 100,
        jobLevel: 50,
        stats: {
          str: 100,
          agi: 1,
          vit: 1,
          int: 1,
          dex: 1,
          luk: 1,
          pow: 3,
          sta: 0,
          wis: 0,
          spl: 0,
          con: 0,
          crt: 0,
        },
      },
      emptyModifierEffects.statBonuses,
    );

    const result = engine.calculate({
      character,
      items: [item],
      modifierEffects: {
        ...emptyModifierEffects,
        raceDamageRate: { demihuman: 15 },
      },
      monster,
      skill,
      skillLevel: 10,
    });

    expect(result.damage.average).toBe(522);
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({
        key: "hits",
        value: 1,
      }),
    );
  });
});
