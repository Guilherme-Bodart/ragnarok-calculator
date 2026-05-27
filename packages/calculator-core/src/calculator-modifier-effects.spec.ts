import { describe, expect, it } from "vitest";
import { CalculatorModifierEffectsFactory } from "./calculator-modifier-effects";
import type { RoItem, RoMonster, RoSkill } from "./ro-types";

const demihumanMonster: RoMonster = {
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
  id: "RK_STORMBLAST",
  name: "Storm Blast",
  classTree: "runeKnight",
  damageType: "physical",
  maxLevel: 5,
  hitCount: 1,
  baseMultiplierByLevel: {},
  source: "manual",
};

const magicalNeutralSkill: RoSkill = {
  id: "AG_STORM_CANNON",
  name: "Storm Cannon",
  classTree: "archMage",
  damageType: "magical",
  element: "neutral",
  maxLevel: 5,
  hitCount: 1,
  baseMultiplierByLevel: {},
  source: "manual",
};

describe("CalculatorModifierEffectsFactory", () => {
  const factory = new CalculatorModifierEffectsFactory();

  it("converts aggregated item modifiers into calculator effects", () => {
    const item: RoItem = {
      id: 1,
      name: "Modifier Test Sword",
      kind: "equipment",
      bonuses: [],
      rawScript: `
        bonus bBaseAtk,100;
        bonus bAllStats,10;
        bonus bStr,5;
        bonus bAtkRate,10;
        bonus2 bAddRace,RC_DemiHuman,15;
      `,
      source: "manual",
    };

    const effects = factory.fromItems([item]);

    expect(effects).toMatchObject({
      statBonuses: {
        str: 15,
        agi: 10,
        vit: 10,
        int: 10,
        dex: 10,
        luk: 10,
      },
      flatAtk: 100,
      flatMatk: 0,
      atkRate: 10,
      matkRate: 0,
      raceDamageRate: {
        demihuman: 15,
      },
      unsupportedStatements: [],
    });
    expect(factory.getFlatPower(effects, "physical")).toBe(100);
    expect(factory.getFlatPower(effects, "magical")).toBe(0);
    expect(
      factory.getPercentPower(
        effects,
        "physical",
        demihumanMonster,
        physicalSkill,
      ),
    ).toBe(25);
  });

  it("converts size, element, and magical targeted modifiers", () => {
    const item: RoItem = {
      id: 3,
      name: "Mixed Modifier Rod",
      kind: "equipment",
      bonuses: [],
      rawScript: `
        bonus bMatk,50;
        bonus bSMatk,5;
        bonus bMatkRate,10;
        bonus2 bAddSize,Size_Medium,5;
        bonus2 bAddEle,Ele_Neutral,7;
        bonus2 bMagicAddRace,RC_DemiHuman,11;
        bonus2 bMagicAddEle,Ele_Neutral,13;
        bonus2 bMagicAddSize,Size_All,19;
        bonus2 bMagicAtkEle,Ele_Neutral,17;
      `,
      source: "manual",
    };

    const effects = factory.fromItems([item]);

    expect(effects).toMatchObject({
      flatMatk: 50,
      smatk: 5,
      matkRate: 10,
      sizeDamageRate: { medium: 5 },
      elementDamageRate: { neutral: 7 },
      magicRaceDamageRate: { demihuman: 11 },
      magicElementDamageRate: { neutral: 13 },
      magicSizeDamageRate: { all: 19 },
      magicElementAttackRate: { neutral: 17 },
    });
    expect(factory.getFlatPower(effects, "magical")).toBe(50);
    expect(
      factory.getPercentPower(
        effects,
        "physical",
        demihumanMonster,
        physicalSkill,
      ),
    ).toBe(12);
    expect(
      factory.getPercentPower(
        effects,
        "magical",
        demihumanMonster,
        magicalNeutralSkill,
      ),
    ).toBe(75);
  });

  it("applies all targets and skill-specific damage", () => {
    const item: RoItem = {
      id: 4,
      name: "All Target Test Sword",
      kind: "equipment",
      bonuses: [],
      rawScript: `
        bonus2 bAddSize,Size_All,5;
        bonus bPAtk,4;
        bonus2 bMagicAddRace,RC_All,7;
        bonus2 bSkillAtk,"RK_STORMBLAST",30;
      `,
      source: "manual",
    };

    const effects = factory.fromItems([item]);

    expect(effects).toMatchObject({
      sizeDamageRate: { all: 5 },
      pAtk: 4,
      magicRaceDamageRate: { all: 7 },
      skillDamageRate: { RK_STORMBLAST: 30 },
    });
    expect(
      factory.getPercentPower(
        effects,
        "physical",
        demihumanMonster,
        physicalSkill,
      ),
    ).toBe(39);
  });

  it("keeps unsupported item script statements visible", () => {
    const item: RoItem = {
      id: 2,
      name: "Unsupported Test Sword",
      kind: "equipment",
      bonuses: [],
      rawScript: 'bonus bAtkRate,5; autobonus "{ bonus bBaseAtk,100; }",10,5000;',
      source: "manual",
    };

    const effects = factory.fromItems([item]);

    expect(effects.atkRate).toBe(5);
    expect(effects.unsupportedStatements).toEqual([
      'autobonus "{ bonus bBaseAtk,100; }",10,5000;',
    ]);
  });

  it("converts status modifiers used by the character status engine", () => {
    const item: RoItem = {
      id: 5,
      name: "Status Modifier Armor",
      kind: "equipment",
      bonuses: [],
      rawScript: `
        bonus bMaxHP,500;
        bonus bMaxHPrate,10;
        bonus bMaxSP,100;
        bonus bMaxSPrate,5;
        bonus bMaxAP,25;
        bonus bHit,15;
        bonus bFlee,20;
        bonus bCritical,7;
        bonus bAspd,1;
        bonus bAspdRate,10;
      `,
      source: "manual",
    };

    const effects = factory.fromItems([item]);

    expect(effects).toMatchObject({
      maxHp: 500,
      maxHpRate: 10,
      maxSp: 100,
      maxSpRate: 5,
      maxAp: 25,
      hit: 15,
      flee: 20,
      crit: 7,
      aspd: 1,
      aspdRate: 10,
    });
  });
});
