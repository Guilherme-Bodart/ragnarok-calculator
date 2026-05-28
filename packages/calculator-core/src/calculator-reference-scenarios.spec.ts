import { describe, expect, it } from "vitest";
import {
  calculateDamageFromDataset,
  type CalculateDamageInput,
} from "./calculate-damage-from-dataset";
import { createCalculatorDatasetFromRathenaNormalized } from "./datasets";

const dataset = createCalculatorDatasetFromRathenaNormalized({
  items: [],
  monsters: [
    {
      monsterId: 1002,
      name: "Poring",
      level: 1,
      hp: 55,
      defense: 2,
      magicDefense: 5,
      size: "Medium",
      race: "Plant",
      element: "Water",
      elementLevel: 1,
      source: "rathena",
    },
    {
      monsterId: 1031,
      name: "Poporing",
      level: 30,
      hp: 489,
      defense: 36,
      magicDefense: 17,
      size: "Medium",
      race: "Plant",
      element: "Poison",
      elementLevel: 1,
      source: "rathena",
    },
  ],
  skills: [
    {
      skillId: 5,
      name: "SM_BASH",
      description: "Bash",
      maxLevel: 10,
      type: "Weapon",
      targetType: "Attack",
      hit: "Single",
      element: "Weapon",
      rawDamageFlags: null,
      raw: {
        HitCount: 1,
      },
      source: "rathena",
    },
    {
      skillId: 14,
      name: "MG_COLDBOLT",
      description: "Cold Bolt",
      maxLevel: 10,
      type: "Magic",
      targetType: "Attack",
      hit: "Multi_Hit",
      element: "Water",
      rawDamageFlags: null,
      raw: {
        HitCount: Array.from({ length: 10 }, (_, index) => ({
          Level: index + 1,
          Count: index + 1,
        })),
      },
      source: "rathena",
    },
  ],
});

const input: Omit<
  CalculateDamageInput,
  "monsterId" | "skillId" | "skillLevel"
> = {
  ruleset: {
    server: "latam",
    mechanics: "renewal",
  },
  learnedSkills: {},
  character: {
    baseLevel: 260,
    jobLevel: 55,
    stats: {
      str: 120,
      agi: 90,
      vit: 100,
      int: 1,
      dex: 100,
      luk: 60,
      pow: 80,
      sta: 0,
      wis: 0,
      spl: 0,
      con: 45,
      crt: 0,
    },
  },
  equipmentItemIds: [],
  cardItemIds: [],
  buffItemIds: [],
  itemContexts: [],
};

describe("calculator reference scenarios", () => {
  it("calculates Bash against the starter targets", () => {
    expect(
      calculateDamageFromDataset(
        {
          ...input,
          monsterId: 1002,
          skillId: "SM_BASH",
          skillLevel: 10,
        },
        dataset,
      ).damage,
    ).toMatchObject({
      average: 4943,
      total: 4943,
    });

    expect(
      calculateDamageFromDataset(
        {
          ...input,
          monsterId: 1031,
          skillId: "SM_BASH",
          skillLevel: 10,
        },
        dataset,
      ).damage,
    ).toMatchObject({
      average: 4557,
      total: 4557,
    });
  });

  it("calculates Cold Bolt total damage using per-level hits and element levels", () => {
    expect(
      calculateDamageFromDataset(
        {
          ...input,
          monsterId: 1002,
          skillId: "MG_COLDBOLT",
          skillLevel: 10,
        },
        dataset,
      ).damage,
    ).toMatchObject({
      average: 75,
      total: 750,
    });

    expect(
      calculateDamageFromDataset(
        {
          ...input,
          monsterId: 1002,
          skillId: "MG_COLDBOLT",
          skillLevel: 5,
        },
        dataset,
      ).damage,
    ).toMatchObject({
      average: 75,
      total: 375,
    });
  });
});
