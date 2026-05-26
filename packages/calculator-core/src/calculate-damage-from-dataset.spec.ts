import { describe, expect, it } from "vitest";
import {
  CalculatorDataError,
  CalculatorInputError,
  calculateDamageFromDataset,
  type CalculateDamageInput,
  type CalculatorDataset,
} from "./calculate-damage-from-dataset";
import type { RoItem, RoMonster, RoSkill } from "./ro-types";

const skill: RoSkill = {
  id: "SM_BASH",
  name: "Bash",
  classTree: "swordman",
  damageType: "physical",
  maxLevel: 10,
  hitCount: 1,
  baseMultiplierByLevel: {
    "10": 100,
  },
  source: "manual",
};

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

const item: RoItem = {
  id: 1,
  name: "Modifier Test Sword",
  kind: "equipment",
  attack: 0,
  bonuses: [],
  rawScript: `
    bonus bBaseAtk,100;
    bonus bAtkRate,10;
    bonus2 bAddRace,RC_DemiHuman,15;
  `,
  source: "manual",
};

const input: CalculateDamageInput = {
  ruleset: {
    server: "latam",
    mechanics: "renewal",
  },
  learnedSkills: {},
  character: {
    baseLevel: 100,
    jobLevel: 50,
    stats: {
      str: 100,
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
  equipmentItemIds: [item.id],
  cardItemIds: [],
  buffItemIds: [],
  itemContexts: [],
  monsterId: monster.id,
  skillId: skill.id,
  skillLevel: 10,
};

const dataset: CalculatorDataset = {
  items: [item],
  monsters: [monster],
  skills: [skill],
};

describe("calculateDamageFromDataset", () => {
  it("calculates damage through the shared core flow", () => {
    const result = calculateDamageFromDataset(input, dataset);

    expect(result.damage.average).toBe(500);
    expect(result.damage.total).toBe(500);
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({
        key: "unsupportedModifierStatements",
        value: 0,
      }),
    );
  });

  it("resolves item context and learned skill conditions before damage", () => {
    const refineItem: RoItem = {
      ...item,
      rawScript: `
        if (getrefine()>=7) bonus bAtkRate,20;
      `,
    };
    const skillItem: RoItem = {
      ...item,
      id: 2,
      name: "Skill Modifier Test Card",
      kind: "card",
      rawScript: `
        if (getskilllv("SM_BASH") >= 10) {
          bonus2 bSkillAtk,"SM_BASH",50;
        }
      `,
    };

    const result = calculateDamageFromDataset(
      {
        ...input,
        equipmentItemIds: [refineItem.id],
        cardItemIds: [skillItem.id],
        learnedSkills: { SM_BASH: 10 },
        itemContexts: [{ itemId: refineItem.id, refine: 7 }],
      },
      {
        ...dataset,
        items: [refineItem, skillItem],
      },
    );

    expect(result.damage.average).toBe(510);
  });

  it("rejects skill levels above the selected skill max level", () => {
    expect(() =>
      calculateDamageFromDataset(
        {
          ...input,
          skillLevel: 11,
        },
        dataset,
      ),
    ).toThrow(CalculatorInputError);
  });

  it("reports missing data as a calculator data error", () => {
    expect(() =>
      calculateDamageFromDataset(
        {
          ...input,
          monsterId: 999999,
        },
        dataset,
      ),
    ).toThrow(CalculatorDataError);
  });
});
