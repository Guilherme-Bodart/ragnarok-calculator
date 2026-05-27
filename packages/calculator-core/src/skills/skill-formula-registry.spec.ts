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
    expect(new SkillFormulaRegistry().calculate(input)).toEqual({
      formulaId: "generic",
      multiplier: 4,
      hitCount: 1,
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
      }),
    };

    expect(new SkillFormulaRegistry([adapter]).calculate(input)).toEqual({
      formulaId: "test-specific",
      multiplier: 9,
      hitCount: 3,
    });
  });
});
