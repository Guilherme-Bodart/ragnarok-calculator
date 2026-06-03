import { describe, expect, it } from "vitest";
import {
  calculatorBuildPayloadVersion,
  isCalculatorBuildPayload,
  migrateCalculatorBuildPayload,
  type CalculatorBuildPayload,
} from "./calculator-build-payload";

const stats = {
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
};

const validPayload: CalculatorBuildPayload = {
  version: calculatorBuildPayloadVersion,
  name: "Build test",
  character: {
    selectedClassId: "Dragon_Knight",
    baseLevel: 260,
    jobLevel: 55,
    stats,
  },
  attack: {
    selectedSkillId: "SM_BASH",
    skillLevel: 10,
  },
  tree: {
    learnedSkills: { SM_BASH: 10 },
  },
  equipment: {
    itemContexts: { 1: { refine: 10 } },
    selectedCardsBySlot: { weapon: [4001] },
    selectedItemsBySlot: { weapon: 1 },
  },
  buffs: {
    activeBuffs: { buff: 1 },
    selectedBuffId: "buff",
  },
  target: {
    selectedMonsterId: 1001,
  },
};

describe("calculator build payload", () => {
  it("accepts a complete sectioned calculator payload", () => {
    expect(isCalculatorBuildPayload(validPayload)).toBe(true);
  });

  it("rejects payloads with missing nested stats", () => {
    const invalidPayload = {
      ...validPayload,
      character: {
        ...validPayload.character,
        stats: {
          ...validPayload.character.stats,
          str: undefined,
        },
      },
    };

    expect(isCalculatorBuildPayload(invalidPayload)).toBe(false);
  });

  it("rejects malformed slot/card data", () => {
    expect(
      isCalculatorBuildPayload({
        ...validPayload,
        equipment: {
          ...validPayload.equipment,
          selectedCardsBySlot: { weapon: ["not-a-number"] },
        },
      }),
    ).toBe(false);
  });

  it("migrates v1 flat payloads without losing build data", () => {
    const migratedPayload = migrateCalculatorBuildPayload({
      version: 1,
      name: "Old build",
      activeBuffs: { buff: 1 },
      baseLevel: 250,
      jobLevel: 50,
      learnedSkills: { SM_BASH: 10 },
      itemContexts: { 1: { refine: 9 } },
      selectedBuffId: "buff",
      selectedCardsBySlot: { weapon: [4001] },
      selectedClassId: "Dragon_Knight",
      selectedItemsBySlot: { weapon: 1 },
      selectedMonsterId: 1002,
      selectedSkillId: "SM_BASH",
      skillLevel: 5,
      stats,
    });

    expect(migratedPayload).toMatchObject({
      version: calculatorBuildPayloadVersion,
      name: "Old build",
      character: {
        selectedClassId: "Dragon_Knight",
        baseLevel: 250,
        jobLevel: 50,
      },
      attack: {
        selectedSkillId: "SM_BASH",
        skillLevel: 5,
      },
      target: {
        selectedMonsterId: 1002,
      },
    });
  });
});
