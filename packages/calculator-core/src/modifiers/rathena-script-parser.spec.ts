import { describe, expect, it } from "vitest";
import { ModifierNormalizer } from "./modifier-normalizer";

describe("ModifierNormalizer", () => {
  const normalizer = new ModifierNormalizer();

  it("normalizes basic bonus commands", () => {
    const result = normalizer.fromRawScript(`
      bonus bAtkRate,5;
      bonus bShortAtkRate,7;
      bonus bLongAtkRate,9;
      bonus bMatkRate,10;
      bonus bBaseAtk,100;
    `);

    expect(result.unsupportedStatements).toEqual([]);
    expect(result.modifiers).toMatchObject([
      {
        stat: "atkRate",
        operator: "addPercent",
        value: 5,
        target: { type: "self" },
        conditions: [],
      },
      {
        stat: "shortAttackRate",
        operator: "addPercent",
        value: 7,
        target: { type: "self" },
        conditions: [],
      },
      {
        stat: "longAttackRate",
        operator: "addPercent",
        value: 9,
        target: { type: "self" },
        conditions: [],
      },
      {
        stat: "matkRate",
        operator: "addPercent",
        value: 10,
        target: { type: "self" },
        conditions: [],
      },
      {
        stat: "baseAtk",
        operator: "addFlat",
        value: 100,
        target: { type: "self" },
        conditions: [],
      },
    ]);
  });

  it("normalizes race damage bonus2 commands to internal race ids", () => {
    const result = normalizer.fromRawScript("bonus2 bAddRace,RC_DemiHuman,15;");

    expect(result.modifiers).toMatchObject([
      {
        stat: "raceDamageRate",
        operator: "addPercent",
        value: 15,
        target: {
          type: "race",
          raceId: "demihuman",
        },
        source: {
          args: ["bAddRace", "RC_DemiHuman", "15"],
        },
      },
    ]);
  });

  it("normalizes race-targeted defense ignore bonus2 commands", () => {
    const result = normalizer.fromRawScript(`
      bonus2 bIgnoreDefRaceRate,RC_DemiHuman,30;
      bonus2 bIgnoreMdefRaceRate,RC_All,40;
    `);

    expect(result.unsupportedStatements).toEqual([]);
    expect(result.modifiers).toMatchObject([
      {
        stat: "ignoreDefenseRate",
        operator: "addPercent",
        value: 30,
        target: {
          type: "race",
          raceId: "demihuman",
        },
      },
      {
        stat: "ignoreMagicDefenseRate",
        operator: "addPercent",
        value: 40,
        target: {
          type: "race",
          raceId: "all",
        },
      },
    ]);
  });

  it("normalizes flat attack and magic attack bonus commands", () => {
    const result = normalizer.fromRawScript(`
      bonus bAtk,25;
      bonus bMatk,30;
      bonus bDef,11;
      bonus bMdef,12;
      bonus bAllStats,10;
      bonus bStr,5;
      bonus bInt,6;
      bonus bDex,7;
      bonus bPow,8;
      bonus bSpl,9;
      bonus bPAtk,4;
      bonus bSMatk,5;
      bonus bCritAtkRate,25;
      bonus bHealPower,30;
      bonus bVariableCastrate,-12;
      bonus bFixedCastrate,-5;
      bonus bFixedCast,-200;
      bonus bDelayrate,-15;
    `);

    expect(result.modifiers).toMatchObject([
      {
        stat: "atk",
        operator: "addFlat",
        value: 25,
        target: { type: "self" },
      },
      {
        stat: "matk",
        operator: "addFlat",
        value: 30,
        target: { type: "self" },
      },
      {
        stat: "defense",
        operator: "addFlat",
        value: 11,
        target: { type: "self" },
      },
      {
        stat: "magicDefense",
        operator: "addFlat",
        value: 12,
        target: { type: "self" },
      },
      {
        stat: "allStats",
        operator: "addFlat",
        value: 10,
        target: { type: "self" },
      },
      {
        stat: "str",
        operator: "addFlat",
        value: 5,
        target: { type: "self" },
      },
      {
        stat: "int",
        operator: "addFlat",
        value: 6,
        target: { type: "self" },
      },
      {
        stat: "dex",
        operator: "addFlat",
        value: 7,
        target: { type: "self" },
      },
      {
        stat: "pow",
        operator: "addFlat",
        value: 8,
        target: { type: "self" },
      },
      {
        stat: "spl",
        operator: "addFlat",
        value: 9,
        target: { type: "self" },
      },
      {
        stat: "pAtk",
        operator: "addFlat",
        value: 4,
        target: { type: "self" },
      },
      {
        stat: "smatk",
        operator: "addFlat",
        value: 5,
        target: { type: "self" },
      },
      {
        stat: "criticalDamageRate",
        operator: "addPercent",
        value: 25,
        target: { type: "self" },
      },
      {
        stat: "healPower",
        operator: "addPercent",
        value: 30,
        target: { type: "self" },
      },
      {
        stat: "variableCastRate",
        operator: "addPercent",
        value: -12,
        target: { type: "self" },
      },
      {
        stat: "fixedCastRate",
        operator: "addPercent",
        value: -5,
        target: { type: "self" },
      },
      {
        stat: "fixedCast",
        operator: "addFlat",
        value: -200,
        target: { type: "self" },
      },
      {
        stat: "afterCastDelayRate",
        operator: "addPercent",
        value: -15,
        target: { type: "self" },
      },
    ]);
  });

  it("normalizes skill-specific cast bonus2 commands", () => {
    const result = normalizer.fromRawScript(`
      bonus2 bVariableCastrate,"WZ_STORMGUST",-8;
      bonus2 bFixedCastrate,"WZ_STORMGUST",-3;
      bonus2 bSkillFixedCast,"WZ_STORMGUST",-150;
    `);

    expect(result.modifiers).toMatchObject([
      {
        stat: "skillVariableCastRate",
        operator: "addPercent",
        value: -8,
        target: { type: "skill", skillId: "WZ_STORMGUST" },
      },
      {
        stat: "skillFixedCastRate",
        operator: "addPercent",
        value: -3,
        target: { type: "skill", skillId: "WZ_STORMGUST" },
      },
      {
        stat: "skillFixedCast",
        operator: "addFlat",
        value: -150,
        target: { type: "skill", skillId: "WZ_STORMGUST" },
      },
    ]);
  });

  it("normalizes size, element, and magical targeted bonus2 commands", () => {
    const result = normalizer.fromRawScript(`
      bonus2 bAddSize,Size_Large,5;
      bonus2 bAddEle,Ele_Fire,7;
      bonus2 bSubRace,RC_DemiHuman,8;
      bonus2 bSubEle,Ele_Fire,9;
      bonus2 bMagicAddRace,RC_DemiHuman,9;
      bonus2 bMagicAddEle,Ele_Ghost,11;
      bonus2 bMagicAddSize,Size_All,12;
      bonus2 bMagicAtkEle,Ele_Wind,13;
      bonus2 bAddClass,Class_All,14;
      bonus2 bMagicAddClass,Class_Boss,15;
      bonus2 bSubClass,Class_Normal,16;
    `);

    expect(result.modifiers).toMatchObject([
      {
        stat: "sizeDamageRate",
        operator: "addPercent",
        value: 5,
        target: { type: "size", sizeId: "large" },
      },
      {
        stat: "elementDamageRate",
        operator: "addPercent",
        value: 7,
        target: { type: "element", elementId: "fire" },
      },
      {
        stat: "incomingRaceDamageReductionRate",
        operator: "addPercent",
        value: 8,
        target: { type: "race", raceId: "demihuman" },
      },
      {
        stat: "incomingElementDamageReductionRate",
        operator: "addPercent",
        value: 9,
        target: { type: "element", elementId: "fire" },
      },
      {
        stat: "magicRaceDamageRate",
        operator: "addPercent",
        value: 9,
        target: { type: "race", raceId: "demihuman" },
      },
      {
        stat: "magicElementDamageRate",
        operator: "addPercent",
        value: 11,
        target: { type: "element", elementId: "ghost" },
      },
      {
        stat: "magicSizeDamageRate",
        operator: "addPercent",
        value: 12,
        target: { type: "size", sizeId: "all" },
      },
      {
        stat: "magicElementAttackRate",
        operator: "addPercent",
        value: 13,
        target: { type: "element", elementId: "wind" },
      },
      {
        stat: "classDamageRate",
        operator: "addPercent",
        value: 14,
        target: { type: "class", classId: "all" },
      },
      {
        stat: "magicClassDamageRate",
        operator: "addPercent",
        value: 15,
        target: { type: "class", classId: "boss" },
      },
      {
        stat: "incomingClassDamageReductionRate",
        operator: "addPercent",
        value: 16,
        target: { type: "class", classId: "normal" },
      },
    ]);
  });

  it("normalizes all targets and skill damage commands", () => {
    const result = normalizer.fromRawScript(`
      bonus2 bAddSize,Size_All,5;
      bonus2 bAddEle,Ele_All,7;
      bonus2 bMagicAddRace,RC_All,9;
      bonus2 bSkillAtk,"RK_STORMBLAST",30;
    `);

    expect(result.modifiers).toMatchObject([
      {
        stat: "sizeDamageRate",
        value: 5,
        target: { type: "size", sizeId: "all" },
      },
      {
        stat: "elementDamageRate",
        value: 7,
        target: { type: "element", elementId: "all" },
      },
      {
        stat: "magicRaceDamageRate",
        value: 9,
        target: { type: "race", raceId: "all" },
      },
      {
        stat: "skillDamageRate",
        value: 30,
        target: { type: "skill", skillId: "RK_STORMBLAST" },
      },
    ]);
  });

  it("evaluates simple refine expressions when context is provided", () => {
    const result = normalizer.fromRawScript(
      `
        .@r = getrefine();
        bonus bMatk,120+(10*(.@r/2));
        bonus2 bMagicAtkEle,Ele_Fire,7*(.@r/3);
        bonus2 bSkillAtk,"RK_STORMBLAST",(.@r>=8?70:(.@r>=6?50:30));
      `,
      { refine: 9 },
    );

    expect(result.unsupportedStatements).toEqual([]);
    expect(result.modifiers).toMatchObject([
      {
        stat: "matk",
        value: 160,
      },
      {
        stat: "magicElementAttackRate",
        value: 21,
      },
      {
        stat: "skillDamageRate",
        value: 70,
      },
    ]);
  });

  it("evaluates BaseLevel and local assignment expressions", () => {
    const result = normalizer.fromRawScript(
      `
        .@val = .@r * 5;
        bonus bBaseAtk,50+BaseLevel;
        bonus bMatk,(.@val);
        bonus2 bSkillAtk,"NC_AXEBOOMERANG",(100+.@val);
      `,
      { baseLevel: 260, refine: 10 },
    );

    expect(result.unsupportedStatements).toEqual([]);
    expect(result.modifiers).toMatchObject([
      {
        stat: "baseAtk",
        value: 310,
      },
      {
        stat: "matk",
        value: 50,
      },
      {
        stat: "skillDamageRate",
        value: 150,
        target: { type: "skill", skillId: "NC_AXEBOOMERANG" },
      },
    ]);
  });

  it("supports simple refine conditions using a refine variable", () => {
    const result = normalizer.fromRawScript(`
      .@r = getrefine();
      if (.@r>=7) {
        bonus bAtkRate,5;
      }
    `);

    expect(result.modifiers).toMatchObject([
      {
        stat: "atkRate",
        value: 5,
        conditions: [{ type: "refine", operator: ">=", value: 7 }],
      },
    ]);
    expect(result.unsupportedStatements).toEqual([]);
  });

  it("supports simple enchant grade conditions using a grade variable", () => {
    const result = normalizer.fromRawScript(`
      .@g = getenchantgrade();
      if (.@g >= ENCHANTGRADE_D) {
        bonus bPAtk,2;
      }
    `);

    expect(result.modifiers).toMatchObject([
      {
        stat: "pAtk",
        value: 2,
        conditions: [{ type: "grade", operator: ">=", value: 1 }],
      },
    ]);
    expect(result.unsupportedStatements).toEqual([]);
  });

  it("attaches simple enchant grade conditions to inline commands", () => {
    const result = normalizer.fromRawScript(
      "if (getenchantgrade()>=ENCHANTGRADE_B) bonus bAtkRate,5;",
    );

    expect(result.modifiers).toMatchObject([
      {
        stat: "atkRate",
        value: 5,
        conditions: [{ type: "grade", operator: ">=", value: 3 }],
      },
    ]);
  });

  it("extracts refine blocks without breaking nested unsupported blocks", () => {
    const result = normalizer.fromRawScript(`
      .@r = getrefine();
      if (.@r>=9) {
        bonus2 bMagicAtkEle,Ele_Fire,15;
        if (getskilllv("RK_DRAGONBREATH") == 10) {
          bonus bLongAtkRate,50;
        }
      }
    `);

    expect(result.modifiers).toMatchObject([
      {
        stat: "magicElementAttackRate",
        value: 15,
        conditions: [{ type: "refine", operator: ">=", value: 9 }],
      },
    ]);
    expect(result.unsupportedStatements).toEqual([
      `if (getskilllv("RK_DRAGONBREATH") == 10) {
          bonus bLongAtkRate,50;
        };`,
    ]);
  });

  it("attaches skill level conditions to simple getskilllv blocks", () => {
    const result = normalizer.fromRawScript(`
      if (getskilllv("RK_DRAGONBREATH") == 10) {
        bonus bLongAtkRate,50;
        bonus2 bSkillAtk,"RK_DRAGONBREATH",30;
      }
    `);

    expect(result.modifiers).toContainEqual(
      expect.objectContaining({
        stat: "longAttackRate",
        value: 50,
        conditions: [
          {
            type: "skillLevel",
            skillId: "RK_DRAGONBREATH",
            operator: "==",
            value: 10,
          },
        ],
      }),
    );
    expect(result.modifiers).toContainEqual(
      expect.objectContaining({
        stat: "skillDamageRate",
        value: 30,
        target: { type: "skill", skillId: "RK_DRAGONBREATH" },
        conditions: [
          {
            type: "skillLevel",
            skillId: "RK_DRAGONBREATH",
            operator: "==",
            value: 10,
          },
        ],
      }),
    );
    expect(result.unsupportedStatements).toEqual([]);
  });

  it("attaches multiple skill level conditions to getskilllv conjunctions", () => {
    const result = normalizer.fromRawScript(`
      if ((getskilllv("RK_DRAGONBREATH") == 10) && (getskilllv("RK_DRAGONBREATH_WATER") == 10)) {
        bonus2 bSkillAtk,"RK_DRAGONBREATH",30;
      }
    `);

    expect(result.modifiers).toMatchObject([
      {
        stat: "skillDamageRate",
        value: 30,
        conditions: [
          {
            type: "skillLevel",
            skillId: "RK_DRAGONBREATH",
            operator: "==",
            value: 10,
          },
          {
            type: "skillLevel",
            skillId: "RK_DRAGONBREATH_WATER",
            operator: "==",
            value: 10,
          },
        ],
      },
    ]);
    expect(result.unsupportedStatements).toEqual([]);
  });

  it("attaches class conditions to BaseJob blocks", () => {
    const result = normalizer.fromRawScript(`
      if (eaclass()&EAJL_THIRD && BaseJob == Job_Knight) {
        bonus2 bSkillAtk,"RK_STORMBLAST",30;
      }
    `);

    expect(result.modifiers).toMatchObject([
      {
        stat: "skillDamageRate",
        value: 30,
        conditions: [
          {
            type: "class",
            classId: "Job_Knight",
            operator: "==",
          },
        ],
      },
    ]);
    expect(result.unsupportedStatements).toEqual([]);
  });

  it("attaches simple refine conditions to inline commands", () => {
    const result = normalizer.fromRawScript(
      "if (getrefine()>=7) bonus bAtkRate,5;",
    );

    expect(result.modifiers).toMatchObject([
      {
        stat: "atkRate",
        value: 5,
        conditions: [{ type: "refine", operator: ">=", value: 7 }],
      },
    ]);
  });

  it("attaches simple refine conditions to block commands", () => {
    const result = normalizer.fromRawScript(`
      if (getrefine() >= 9) {
        bonus bBaseAtk,100;
        bonus2 bAddRace,RC_DemiHuman,15;
      }
    `);

    expect(result.modifiers).toMatchObject([
      {
        stat: "baseAtk",
        value: 100,
        conditions: [{ type: "refine", operator: ">=", value: 9 }],
      },
      {
        stat: "raceDamageRate",
        value: 15,
        target: { type: "race", raceId: "demihuman" },
        conditions: [{ type: "refine", operator: ">=", value: 9 }],
      },
    ]);
  });

  it("combines nested refine and enchant grade conditions", () => {
    const result = normalizer.fromRawScript(`
      .@r = getrefine();
      .@g = getenchantgrade();
      if (.@r>=9) {
        if (.@g>=ENCHANTGRADE_D) {
          bonus bPAtk,2;
        }
      }
    `);

    expect(result.modifiers).toMatchObject([
      {
        stat: "pAtk",
        value: 2,
        conditions: [
          { type: "refine", operator: ">=", value: 9 },
          { type: "grade", operator: ">=", value: 1 },
        ],
      },
    ]);
    expect(result.unsupportedStatements).toEqual([]);
  });

  it("combines nested enchant grade and refine conditions", () => {
    const result = normalizer.fromRawScript(`
      .@r = getrefine();
      .@g = getenchantgrade();
      if (.@g>=ENCHANTGRADE_C) {
        if (.@r>=11) {
          bonus bSMatk,3;
        }
      }
    `);

    expect(result.modifiers).toMatchObject([
      {
        stat: "smatk",
        value: 3,
        conditions: [
          { type: "grade", operator: ">=", value: 2 },
          { type: "refine", operator: ">=", value: 11 },
        ],
      },
    ]);
    expect(result.unsupportedStatements).toEqual([]);
  });

  it("keeps unsupported statements visible for incremental parser work", () => {
    const result = normalizer.fromRawScript(`
      bonus bAtkRate,5;
      autobonus "{ bonus bBaseAtk,100; }",10,5000;
    `);

    expect(result.modifiers).toHaveLength(1);
    expect(result.unsupportedStatements).toEqual([
      'autobonus "{ bonus bBaseAtk,100; }",10,5000;',
    ]);
  });

  it("keeps unsupported quoted scripts intact while parsing skill blocks", () => {
    const result = normalizer.fromRawScript(`
      autobonus3 "{ bonus bAtkRate,-50; bonus bNoKnockback; }",1000,5000;
      if (getskilllv("RK_DRAGONBREATH") == 10) {
        bonus bLongAtkRate,50;
        bonus2 bSkillAtk,"RK_DRAGONBREATH",30;
      }
    `);

    expect(result.modifiers).toContainEqual(
      expect.objectContaining({
        stat: "longAttackRate",
        value: 50,
        conditions: [
          {
            type: "skillLevel",
            skillId: "RK_DRAGONBREATH",
            operator: "==",
            value: 10,
          },
        ],
      }),
    );
    expect(result.modifiers).toContainEqual(
      expect.objectContaining({
        stat: "skillDamageRate",
        value: 30,
        conditions: [
          {
            type: "skillLevel",
            skillId: "RK_DRAGONBREATH",
            operator: "==",
            value: 10,
          },
        ],
      }),
    );
    expect(result.unsupportedStatements).toEqual([
      'autobonus3 "{ bonus bAtkRate,-50; bonus bNoKnockback; }",1000,5000;',
    ]);
  });
});
