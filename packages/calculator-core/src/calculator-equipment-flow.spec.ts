import { describe, expect, it } from "vitest";
import {
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

const weapon: RoItem = {
  id: 10,
  name: "Refine Test Sword",
  kind: "equipment",
  attack: 0,
  bonuses: [],
  rawScript: `
    bonus bBaseAtk,50;
    if (getrefine()>=7) bonus bAtkRate,20;
  `,
  source: "manual",
};

const card: RoItem = {
  id: 11,
  name: "Race Skill Test Card",
  kind: "card",
  attack: 0,
  bonuses: [],
  rawScript: `
    bonus2 bAddRace,RC_DemiHuman,10;
    bonus2 bSkillAtk,"SM_BASH",20;
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
  equipmentItemIds: [weapon.id],
  cardItemIds: [card.id],
  buffItemIds: [],
  itemContexts: [{ itemId: weapon.id, refine: 7 }],
  monsterId: monster.id,
  skillId: skill.id,
  skillLevel: 10,
};

const dataset: CalculatorDataset = {
  items: [weapon, card],
  monsters: [monster],
  skills: [skill],
};

describe("calculator equipment flow", () => {
  it("applies equipment, card and refine-script modifiers without unsupported statements", () => {
    const result = calculateDamageFromDataset(input, dataset);

    expect(result.breakdown).toContainEqual(
      expect.objectContaining({
        key: "unsupportedModifierStatements",
        value: 0,
      }),
    );
    expect(result.damage.average).toBeGreaterThan(0);
    expect(result.damage.total).toBe(result.damage.average);
  });
});
