import { describe, expect, it } from "vitest";
import { ModifierAggregator } from "./modifier-aggregator";
import { ModifierNormalizer } from "./modifier-normalizer";
import { ModifierResolver } from "./modifier-resolver";

const rawScriptFixtures = {
  repeatedAtkRate: `
    bonus bAtkRate,5;
    bonus bAtkRate,3;
  `,
  mixedTargets: `
    bonus bAtkRate,5;
    bonus2 bAddRace,RC_DemiHuman,15;
    bonus2 bAddRace,RC_DemiHuman,10;
  `,
  refine: `
    bonus bAtkRate,5;
    if (getrefine()>=7) bonus bAtkRate,3;
  `,
};

describe("ModifierAggregator", () => {
  const normalizer = new ModifierNormalizer();
  const resolver = new ModifierResolver();
  const aggregator = new ModifierAggregator();

  it("sums modifiers with the same stat, operator, and target", () => {
    const parsed = normalizer.fromRawScript(rawScriptFixtures.repeatedAtkRate);
    const result = aggregator.aggregate(parsed.modifiers);

    expect(result.buckets).toMatchObject([
      {
        stat: "atkRate",
        operator: "addPercent",
        target: { type: "self" },
        value: 8,
      },
    ]);
    expect(result.buckets[0].breakdown).toHaveLength(2);
  });

  it("keeps different targets in separate buckets", () => {
    const parsed = normalizer.fromRawScript(rawScriptFixtures.mixedTargets);
    const result = aggregator.aggregate(parsed.modifiers);

    expect(result.buckets).toMatchObject([
      {
        stat: "atkRate",
        target: { type: "self" },
        value: 5,
      },
      {
        stat: "raceDamageRate",
        target: { type: "race", raceId: "demihuman" },
        value: 25,
      },
    ]);
  });

  it("aggregates only modifiers resolved for the item context", () => {
    const parsed = normalizer.fromRawScript(rawScriptFixtures.refine);
    const applicableModifiers = resolver.resolve(parsed.modifiers, { refine: 7 });
    const result = aggregator.aggregate(applicableModifiers);

    expect(result.buckets).toMatchObject([
      {
        stat: "atkRate",
        target: { type: "self" },
        value: 8,
      },
    ]);
  });

  it("does not aggregate unresolved refine modifiers", () => {
    const parsed = normalizer.fromRawScript(rawScriptFixtures.refine);
    const applicableModifiers = resolver.resolve(parsed.modifiers, { refine: 6 });
    const result = aggregator.aggregate(applicableModifiers);

    expect(result.buckets).toMatchObject([
      {
        stat: "atkRate",
        target: { type: "self" },
        value: 5,
      },
    ]);
  });
});
