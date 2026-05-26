import { describe, expect, it } from "vitest";
import { ModifierNormalizer } from "./modifier-normalizer";
import { ModifierResolver } from "./modifier-resolver";

describe("ModifierResolver", () => {
  const normalizer = new ModifierNormalizer();
  const resolver = new ModifierResolver();

  it("keeps modifiers without conditions applicable", () => {
    const parsed = normalizer.fromRawScript("bonus bAtkRate,5;");

    expect(resolver.resolve(parsed.modifiers)).toMatchObject([
      {
        stat: "atkRate",
        value: 5,
      },
    ]);
  });

  it("keeps refine modifiers when the item refine matches", () => {
    const parsed = normalizer.fromRawScript(
      "if (getrefine()>=7) bonus bAtkRate,5;",
    );

    expect(resolver.resolve(parsed.modifiers, { refine: 7 })).toMatchObject([
      {
        stat: "atkRate",
        value: 5,
      },
    ]);
  });

  it("filters refine modifiers when the item refine is too low", () => {
    const parsed = normalizer.fromRawScript(
      "if (getrefine()>=7) bonus bAtkRate,5;",
    );

    expect(resolver.resolve(parsed.modifiers, { refine: 6 })).toEqual([]);
  });

  it("filters refine modifiers when refine context is missing", () => {
    const parsed = normalizer.fromRawScript(
      "if (getrefine()>=7) bonus bAtkRate,5;",
    );

    expect(resolver.resolve(parsed.modifiers)).toEqual([]);
  });

  it("requires every condition on a modifier to match", () => {
    const parsed = normalizer.fromRawScript(
      "if (getrefine()>=7) bonus bAtkRate,5;",
    );
    const modifier = {
      ...parsed.modifiers[0],
      conditions: [
        ...parsed.modifiers[0].conditions,
        { type: "refine" as const, operator: "<" as const, value: 10 },
      ],
    };

    expect(resolver.resolve([modifier], { refine: 9 })).toHaveLength(1);
    expect(resolver.resolve([modifier], { refine: 10 })).toEqual([]);
  });

  it("resolves skill level conditions only when learned skill context matches", () => {
    const parsed = normalizer.fromRawScript(`
      if (getskilllv("RK_DRAGONBREATH") == 10) {
        bonus2 bSkillAtk,"RK_DRAGONBREATH",30;
      }
    `);

    expect(resolver.resolve(parsed.modifiers)).toEqual([]);
    expect(
      resolver.resolve(parsed.modifiers, {
        learnedSkills: { RK_DRAGONBREATH: 9 },
      }),
    ).toEqual([]);
    expect(
      resolver.resolve(parsed.modifiers, {
        learnedSkills: { RK_DRAGONBREATH: 10 },
      }),
    ).toMatchObject([
      {
        stat: "skillDamageRate",
        value: 30,
      },
    ]);
  });

  it("resolves class conditions only when class context matches", () => {
    const parsed = normalizer.fromRawScript(`
      if (BaseJob == Job_Knight) {
        bonus2 bSkillAtk,"RK_STORMBLAST",30;
      }
    `);

    expect(resolver.resolve(parsed.modifiers)).toEqual([]);
    expect(resolver.resolve(parsed.modifiers, { classId: "Job_Mage" })).toEqual(
      [],
    );
    expect(
      resolver.resolve(parsed.modifiers, { classId: "Job_Knight" }),
    ).toMatchObject([
      {
        stat: "skillDamageRate",
        value: 30,
      },
    ]);
  });
});
