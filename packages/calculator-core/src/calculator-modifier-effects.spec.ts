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
        bonus bDef,12;
        bonus bMdef,7;
        bonus bAllStats,10;
        bonus bStr,5;
        bonus bAtkRate,10;
        bonus bShortAtkRate,7;
        bonus bLongAtkRate,9;
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
        pow: 0,
        sta: 0,
        wis: 0,
        spl: 0,
        con: 0,
        crt: 0,
      },
      flatAtk: 100,
      flatMatk: 0,
      flatDefense: 12,
      flatMagicDefense: 7,
      atkRate: 10,
      shortAttackRate: 7,
      longAttackRate: 9,
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
    ).toBe(32);
  });

  it("converts fourth job trait stats into item stat bonuses", () => {
    const item: RoItem = {
      id: 2,
      name: "Trait Test Armor",
      kind: "equipment",
      bonuses: [],
      rawScript: `
        bonus bPow,3;
        bonus bSta,4;
        bonus bWis,5;
        bonus bSpl,6;
        bonus bCon,7;
        bonus bCrt,8;
      `,
      source: "manual",
    };

    const effects = factory.fromItems([item]);

    expect(effects.statBonuses).toMatchObject({
      pow: 3,
      sta: 4,
      wis: 5,
      spl: 6,
      con: 7,
      crt: 8,
    });
    expect(effects.unsupportedStatements).toEqual([]);
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
        bonus2 bSubRace,RC_DemiHuman,6;
        bonus2 bSubEle,Ele_Neutral,8;
        bonus2 bMagicAddRace,RC_DemiHuman,11;
        bonus2 bMagicAddEle,Ele_Neutral,13;
        bonus2 bMagicAddSize,Size_All,19;
        bonus2 bMagicAtkEle,Ele_Neutral,17;
        bonus2 bAddClass,Class_All,23;
        bonus2 bMagicAddClass,Class_Boss,29;
        bonus2 bSubClass,Class_Normal,31;
        bonus2 bIgnoreDefRaceRate,RC_DemiHuman,30;
        bonus2 bIgnoreMdefRaceRate,RC_All,40;
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
      incomingRaceDamageReductionRate: { demihuman: 6 },
      incomingElementDamageReductionRate: { neutral: 8 },
      magicRaceDamageRate: { demihuman: 11 },
      magicElementDamageRate: { neutral: 13 },
      magicSizeDamageRate: { all: 19 },
      magicElementAttackRate: { neutral: 17 },
      classDamageRate: { all: 23 },
      magicClassDamageRate: { boss: 29 },
      incomingClassDamageReductionRate: { normal: 31 },
      ignoreDefenseRate: { demihuman: 30 },
      ignoreMagicDefenseRate: { all: 40 },
    });
    expect(factory.getFlatPower(effects, "magical")).toBe(50);
    expect(
      factory.getPercentPower(
        effects,
        "physical",
        demihumanMonster,
        physicalSkill,
      ),
    ).toBe(35);
    expect(
      factory.getPercentPower(
        effects,
        "magical",
        { ...demihumanMonster, classType: "boss" },
        magicalNeutralSkill,
      ),
    ).toBe(104);
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
        bonus bCritAtkRate,25;
        bonus bHealPower,30;
        bonus bAspd,1;
        bonus bAspdRate,10;
        bonus bVariableCastrate,-12;
        bonus bFixedCastrate,-5;
        bonus bFixedCast,-200;
        bonus bDelayrate,-15;
        bonus2 bVariableCastrate,"WZ_STORMGUST",-8;
        bonus2 bFixedCastrate,"WZ_STORMGUST",-3;
        bonus2 bSkillFixedCast,"WZ_STORMGUST",-150;
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
      criticalDamageRate: 25,
      healPower: 30,
      aspd: 1,
      aspdRate: 10,
      variableCastRate: -12,
      fixedCastRate: -5,
      fixedCast: -200,
      afterCastDelayRate: -15,
      skillVariableCastRate: { WZ_STORMGUST: -8 },
      skillFixedCastRate: { WZ_STORMGUST: -3 },
      skillFixedCast: { WZ_STORMGUST: -150 },
    });
  });
});
