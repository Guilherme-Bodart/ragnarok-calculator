import { describe, expect, it } from "vitest";
import type { CalculatorModifierEffects } from "./calculator-modifier-effects";
import { DamageFormulaPipeline } from "./damage-formula-pipeline";
import { EffectiveCharacterBuilder } from "./effective-character";
import type { RoItem, RoMonster, RoSkill } from "./ro-types";

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

const neutralTarget: RoMonster = {
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

const physicalSkill: RoSkill = {
  id: "SM_BASH",
  name: "Bash",
  classTree: "swordman",
  damageType: "physical",
  maxLevel: 10,
  hitCount: 1,
  baseMultiplierByLevel: { "10": 100 },
  source: "manual",
};

const magicalSkill: RoSkill = {
  id: "MG_FIREBOLT",
  name: "Fire Bolt",
  classTree: "mage",
  damageType: "magical",
  element: "fire",
  maxLevel: 10,
  hitCount: 10,
  baseMultiplierByLevel: { "10": 100 },
  source: "manual",
};

describe("DamageFormulaPipeline", () => {
  const pipeline = new DamageFormulaPipeline();
  const character = new EffectiveCharacterBuilder().build(
    {
      baseLevel: 100,
      jobLevel: 50,
      stats: {
        str: 100,
        agi: 1,
        vit: 1,
        int: 100,
        dex: 50,
        luk: 1,
        pow: 0,
        sta: 0,
        wis: 0,
        spl: 0,
        con: 0,
        crt: 0,
      },
    },
    emptyModifierEffects.statBonuses,
  );

  it("keeps physical formula steps addressable for the frontend", () => {
    const weapon: RoItem = {
      id: 1,
      name: "MVP Sword",
      kind: "equipment",
      attack: 100,
      bonuses: [{ type: "atkRate", value: 10 }],
      source: "manual",
    };

    const result = pipeline.calculate({
      character,
      items: [weapon],
      modifierEffects: {
        ...emptyModifierEffects,
        raceDamageRate: { demihuman: 15 },
      },
      monster: neutralTarget,
      skill: physicalSkill,
      skillLevel: 10,
    });

    expect(result.damage.average).toBe(512);
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({
        key: "finalRateMultiplier",
        value: 1.25,
      }),
    );
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({
        key: "preDefenseDamage",
        value: 512,
      }),
    );
  });

  it("applies magical power, element multiplier, mdef and multi-hit total", () => {
    const staff: RoItem = {
      id: 2,
      name: "MVP Staff",
      kind: "equipment",
      magicAttack: 100,
      bonuses: [{ type: "matkRate", value: 20 }],
      source: "manual",
    };
    const earthTarget: RoMonster = {
      ...neutralTarget,
      element: "earth",
      magicDefense: 100,
    };

    const result = pipeline.calculate({
      character,
      items: [staff],
      modifierEffects: {
        ...emptyModifierEffects,
        flatMatk: 50,
        smatk: 5,
      },
      monster: earthTarget,
      skill: magicalSkill,
      skillLevel: 10,
    });

    expect(result.damage.average).toBe(689);
    expect(result.damage.total).toBe(6890);
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({
        key: "elementMultiplier",
        value: 1.5,
      }),
    );
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({
        key: "defenseMultiplier",
        value: 0.8,
      }),
    );
  });
});
