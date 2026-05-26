import { describe, expect, it } from "vitest";
import { ModifierNormalizer } from "./modifier-normalizer";

describe("ModifierNormalizer", () => {
  const normalizer = new ModifierNormalizer();

  it("normalizes basic bonus commands", () => {
    const result = normalizer.fromRawScript(`
      bonus bAtkRate,5;
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

  it("normalizes flat attack and magic attack bonus commands", () => {
    const result = normalizer.fromRawScript(`
      bonus bAtk,25;
      bonus bMatk,30;
      bonus bAllStats,10;
      bonus bStr,5;
      bonus bInt,6;
      bonus bDex,7;
      bonus bPAtk,4;
      bonus bSMatk,5;
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
    ]);
  });

  it("normalizes size, element, and magical targeted bonus2 commands", () => {
    const result = normalizer.fromRawScript(`
      bonus2 bAddSize,Size_Large,5;
      bonus2 bAddEle,Ele_Fire,7;
      bonus2 bMagicAddRace,RC_DemiHuman,9;
      bonus2 bMagicAddEle,Ele_Ghost,11;
      bonus2 bMagicAddSize,Size_All,12;
      bonus2 bMagicAtkEle,Ele_Wind,13;
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

    expect(result.modifiers).toMatchObject([
      {
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
      },
    ]);
    expect(result.unsupportedStatements).toEqual(["bonus bLongAtkRate,50;"]);
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
        ],
      },
    ]);
    expect(result.unsupportedStatements).toEqual([
      "bonus bLongAtkRate,50;",
      'autobonus3 "{ bonus bAtkRate,-50; bonus bNoKnockback; }",1000,5000;',
    ]);
  });
});
