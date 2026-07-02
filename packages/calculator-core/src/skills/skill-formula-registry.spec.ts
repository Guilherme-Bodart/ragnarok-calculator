import { describe, expect, it } from "vitest";
import { CharacterStatusEngine } from "../character-status-engine";
import { SkillFormulaRegistry } from "./skill-formula-registry";
import type { SkillFormulaAdapter, SkillFormulaInput } from "./skill-formula.types";

const input: SkillFormulaInput = {
  character: new CharacterStatusEngine().calculate({
    character: {
      baseLevel: 100,
      jobLevel: 50,
      stats: {
        str: 1,
        agi: 1,
        vit: 1,
        int: 1,
        dex: 1,
        luk: 1,
        pow: 0,
        sta: 0,
        wis: 0,
        spl: 0,
        con: 0,
        crt: 0,
      },
    },
  }),
  monster: {
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
  },
  skill: {
    id: "SM_BASH",
    name: "Bash",
    classTree: "swordman",
    damageType: "physical",
    maxLevel: 10,
    hitCount: 1,
    baseMultiplierByLevel: {
      "10": 400,
    },
    source: "manual",
  },
  skillLevel: 10,
};

describe("SkillFormulaRegistry", () => {
  it("uses generic skill data when no specific adapter is registered", () => {
    expect(
      new SkillFormulaRegistry().calculate({
        ...input,
        skill: {
          ...input.skill,
          id: "GENERIC_TEST",
        },
      }),
    ).toEqual({
      formulaId: "generic",
      multiplier: 4,
      hitCount: 1,
      precision: "inferred",
    });
  });

  it("uses a static adapter for known starter skills", () => {
    expect(new SkillFormulaRegistry().calculate(input)).toEqual({
      formulaId: "static:SM_BASH",
      multiplier: 4,
      hitCount: 1,
      precision: "validated",
    });
  });

  it("uses static swordman and knight formulas validated from tooltip data", () => {
    expect(
      new SkillFormulaRegistry().calculate({
        ...input,
        skill: {
          ...input.skill,
          id: "SM_MAGNUM",
        },
        skillLevel: 10,
      }),
    ).toEqual({
      formulaId: "static:SM_MAGNUM",
      multiplier: 3,
      hitCount: 1,
      precision: "validated",
    });

    expect(
      new SkillFormulaRegistry().calculate({
        ...input,
        skill: {
          ...input.skill,
          id: "KN_BOWLINGBASH",
        },
        skillLevel: 10,
      }),
    ).toEqual({
      formulaId: "static:KN_BOWLINGBASH",
      multiplier: 5,
      hitCount: 1,
      precision: "validated",
    });
  });

  it.each(["MG_COLDBOLT", "MG_FIREBOLT", "MG_LIGHTNINGBOLT"])(
    "uses static bolt formula for %s",
    (skillId) => {
      expect(
        new SkillFormulaRegistry().calculate({
          ...input,
          skill: {
            ...input.skill,
            id: skillId,
            damageType: "magical",
            maxLevel: 10,
          },
          skillLevel: 7,
        }),
      ).toEqual({
        formulaId: `static:${skillId}`,
        multiplier: 1,
        hitCount: 7,
        precision: "validated",
      });
    },
  );

  it("uses the LATAM Soul Vulcan Strike formula with base level and SPL scaling", () => {
    const character = new CharacterStatusEngine().calculate({
      character: {
        baseLevel: 229,
        jobLevel: 46,
        classId: "Arch_Mage",
        stats: {
          str: 20,
          agi: 103,
          vit: 100,
          int: 125,
          dex: 120,
          luk: 83,
          pow: 0,
          sta: 0,
          wis: 0,
          spl: 100,
          con: 14,
          crt: 0,
        },
      },
    });

    expect(
      new SkillFormulaRegistry().calculate({
        ...input,
        character,
        skill: {
          ...input.skill,
          id: "AG_SOUL_VC_STRIKE",
          damageType: "magical",
          maxLevel: 5,
          hitCount: 7,
          hitCountByLevel: {
            "1": 3,
            "2": 4,
            "3": 5,
            "4": 6,
            "5": 7,
          },
        },
        skillLevel: 5,
      }),
    ).toEqual({
      formulaId: "static:AG_SOUL_VC_STRIKE",
      // LATAM 180% por nível: (180*5 + spl:100 * 3) * baseLevel:229 / 10000
      // = (900 + 300) * 229 / 10000 = 1200 * 229 / 10000 = 27.48
      multiplier: 27.48,
      hitCount: 7,
      precision: "validated",
    });
  });

  it("uses per-level hit counts when skill data provides them", () => {
    expect(
      new SkillFormulaRegistry().calculate({
        ...input,
        skill: {
          ...input.skill,
          id: "GENERIC_TEST",
          hitCount: 10,
          hitCountByLevel: {
            "1": 1,
            "5": 5,
            "10": 10,
          },
        },
        skillLevel: 5,
      }),
    ).toEqual({
      formulaId: "generic",
      multiplier: 1,
      hitCount: 5,
      precision: "prototype",
    });
  });

  it("allows specific skill adapters to override generic behavior", () => {
    const adapter: SkillFormulaAdapter = {
      id: "test-specific",
      supports: (skill) => skill.id === "SM_BASH",
      calculate: () => ({
        formulaId: "test-specific",
        multiplier: 9,
        hitCount: 3,
        precision: "validated",
      }),
    };

    expect(new SkillFormulaRegistry([adapter]).calculate(input)).toEqual({
      formulaId: "test-specific",
      multiplier: 9,
      hitCount: 3,
      precision: "validated",
    });
  });
});
