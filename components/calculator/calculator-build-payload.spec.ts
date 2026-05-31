import { describe, expect, it } from "vitest";
import {
  calculatorBuildPayloadVersion,
  isCalculatorBuildPayload,
  type CalculatorBuildPayload,
} from "./calculator-build-payload";

const validPayload: CalculatorBuildPayload = {
  version: calculatorBuildPayloadVersion,
  name: "Build test",
  activeBuffs: { buff: 1 },
  baseLevel: 260,
  jobLevel: 55,
  learnedSkills: { SM_BASH: 10 },
  itemContexts: { 1: { refine: 10 } },
  selectedBuffId: "buff",
  selectedCardsBySlot: { weapon: [4001] },
  selectedClassId: "Dragon_Knight",
  selectedItemsBySlot: { weapon: 1 },
  selectedMonsterId: 1001,
  selectedSkillId: "SM_BASH",
  skillLevel: 10,
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
};

describe("isCalculatorBuildPayload", () => {
  it("accepts a complete versioned calculator payload", () => {
    expect(isCalculatorBuildPayload(validPayload)).toBe(true);
  });

  it("rejects payloads with missing nested stats", () => {
    const invalidPayload = {
      ...validPayload,
      stats: {
        ...validPayload.stats,
        str: undefined,
      },
    };

    expect(isCalculatorBuildPayload(invalidPayload)).toBe(false);
  });

  it("rejects malformed slot/card data", () => {
    expect(
      isCalculatorBuildPayload({
        ...validPayload,
        selectedCardsBySlot: { weapon: ["not-a-number"] },
      }),
    ).toBe(false);
  });
});
