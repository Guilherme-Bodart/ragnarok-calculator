import { describe, expect, it } from "vitest";
import { calculateDamageSchema } from "./calculator.schemas";

const minimumPayload = {
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
    },
  },
  monsterId: 1001,
  skillId: "SM_BASH",
  skillLevel: 10,
};

describe("calculateDamageSchema", () => {
  it("defaults to LATAM Renewal rules when ruleset is omitted", () => {
    const parsed = calculateDamageSchema.parse(minimumPayload);

    expect(parsed.ruleset).toEqual({
      server: "latam",
      mechanics: "renewal",
    });
    expect(parsed.learnedSkills).toEqual({});
    expect(parsed.character).toMatchObject({
      isTranscendent: false,
      weaponType: "bareHand",
      weaponLevel: 0,
      weaponRefine: 0,
    });
  });

  it("accepts an explicit ruleset context", () => {
    const parsed = calculateDamageSchema.parse({
      ...minimumPayload,
      ruleset: {
        server: "iro",
        mechanics: "renewal",
        episode: "future-check",
      },
    });

    expect(parsed.ruleset).toEqual({
      server: "iro",
      mechanics: "renewal",
      episode: "future-check",
    });
  });

  it("allows skill levels above 10 so the calculator data can enforce maxLevel", () => {
    const parsed = calculateDamageSchema.parse({
      ...minimumPayload,
      skillLevel: 15,
    });

    expect(parsed.skillLevel).toBe(15);
  });

  it("accepts optional weapon and base job metadata", () => {
    const parsed = calculateDamageSchema.parse({
      ...minimumPayload,
      character: {
        ...minimumPayload.character,
        baseJob: "Swordman",
        isTranscendent: true,
        weaponType: "twoHandSword",
        weaponLevel: 4,
        weaponRefine: 12,
      },
    });

    expect(parsed.character).toMatchObject({
      baseJob: "Swordman",
      isTranscendent: true,
      weaponType: "twoHandSword",
      weaponLevel: 4,
      weaponRefine: 12,
    });
  });
});
