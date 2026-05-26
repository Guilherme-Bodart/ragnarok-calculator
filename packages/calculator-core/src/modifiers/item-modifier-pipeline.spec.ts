import { describe, expect, it } from "vitest";
import { ItemModifierPipeline } from "./item-modifier-pipeline";
import { ModifierNormalizer } from "./modifier-normalizer";

const rawScriptFixtures = {
  mixed: `
    bonus bAtkRate,5;
    if (getrefine()>=7) bonus bAtkRate,3;
    bonus2 bAddRace,RC_DemiHuman,15;
  `,
  unsupported: `
    bonus bAtkRate,5;
    autobonus "{ bonus bBaseAtk,100; }",10,5000;
  `,
};

describe("ItemModifierPipeline", () => {
  const pipeline = new ItemModifierPipeline();

  it("parses, resolves, and aggregates raw scripts", () => {
    const result = pipeline.getEffects(
      { rawScript: rawScriptFixtures.mixed },
      { refine: 7 },
    );

    expect(result.inputModifiers).toHaveLength(3);
    expect(result.applicableModifiers).toHaveLength(3);
    expect(result.aggregation.buckets).toMatchObject([
      {
        stat: "atkRate",
        operator: "addPercent",
        target: { type: "self" },
        value: 8,
      },
      {
        stat: "raceDamageRate",
        operator: "addPercent",
        target: { type: "race", raceId: "demihuman" },
        value: 15,
      },
    ]);
  });

  it("filters raw script modifiers by item context before aggregation", () => {
    const result = pipeline.getEffects(
      { rawScript: rawScriptFixtures.mixed },
      { refine: 6 },
    );

    expect(result.inputModifiers).toHaveLength(3);
    expect(result.applicableModifiers).toHaveLength(2);
    expect(result.aggregation.buckets).toMatchObject([
      {
        stat: "atkRate",
        value: 5,
      },
      {
        stat: "raceDamageRate",
        value: 15,
      },
    ]);
  });

  it("uses pre-normalized modifiers without parsing rawScript again", () => {
    const normalizer = new ModifierNormalizer();
    const preNormalized = normalizer.fromRawScript("bonus bAtkRate,5;").modifiers;

    const result = pipeline.getEffects({
      rawScript: rawScriptFixtures.unsupported,
      modifiers: preNormalized,
    });

    expect(result.inputModifiers).toHaveLength(1);
    expect(result.unsupportedStatements).toEqual([]);
    expect(result.aggregation.buckets).toMatchObject([
      {
        stat: "atkRate",
        value: 5,
      },
    ]);
  });

  it("keeps unsupported raw script statements visible", () => {
    const result = pipeline.getEffects({ rawScript: rawScriptFixtures.unsupported });

    expect(result.aggregation.buckets).toMatchObject([
      {
        stat: "atkRate",
        value: 5,
      },
    ]);
    expect(result.unsupportedStatements).toEqual([
      'autobonus "{ bonus bBaseAtk,100; }",10,5000;',
    ]);
  });

  it("returns an empty result for items without modifier data", () => {
    const result = pipeline.getEffects({});

    expect(result).toMatchObject({
      inputModifiers: [],
      applicableModifiers: [],
      aggregation: { buckets: [] },
      unsupportedStatements: [],
    });
  });
});
