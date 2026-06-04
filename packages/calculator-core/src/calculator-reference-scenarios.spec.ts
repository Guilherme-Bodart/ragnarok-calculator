import { describe, expect, it } from "vitest";
import {
  calculateDamageFromDataset,
  type CalculateDamageInput,
} from "./calculate-damage-from-dataset";
import type { CalculateDamageResult } from "./calculation-result";
import { createCalculatorDatasetFromRathenaNormalized } from "./datasets";
import type { RathenaNormalizedDataset } from "./datasets/rathena-normalized";
import reference from "./reference-scenarios/starter-reference.json";

type ReferenceExpected = {
  damage: Partial<CalculateDamageResult["damage"]>;
  breakdown: Record<string, number>;
};

type ReferenceScenario = {
  id: string;
  input: Pick<CalculateDamageInput, "monsterId" | "skillId" | "skillLevel">;
  expected: ReferenceExpected;
  tongCalc: {
    expected: ReferenceExpected | null;
  };
};

type ReferenceFile = {
  dataset: RathenaNormalizedDataset;
  baseInput: Omit<CalculateDamageInput, "monsterId" | "skillId" | "skillLevel">;
  cases: ReferenceScenario[];
};

const typedReference = reference as unknown as ReferenceFile;
const dataset = createCalculatorDatasetFromRathenaNormalized(typedReference.dataset);

describe("calculator reference scenarios", () => {
  it.each(typedReference.cases)("$id matches the local reference JSON", (scenario) => {
    const result = calculateDamageFromDataset(
      {
        ...typedReference.baseInput,
        ...scenario.input,
      },
      dataset,
    );

    expect(result.damage).toMatchObject(scenario.expected.damage);
    expect(Object.fromEntries(result.breakdown.map((line) => [line.key, line.value])))
      .toMatchObject(scenario.expected.breakdown);
  });

  it.each(typedReference.cases.filter(hasTongCalculatorExpected))(
    "$id matches confirmed Tong Calculator values",
    (scenario) => {
      const result = calculateDamageFromDataset(
        {
          ...typedReference.baseInput,
          ...scenario.input,
        },
        dataset,
      );
      const expected = scenario.tongCalc.expected;

      expect(result.damage).toMatchObject(expected.damage);
      expect(Object.fromEntries(result.breakdown.map((line) => [line.key, line.value])))
        .toMatchObject(expected.breakdown);
    },
  );
});

function hasTongCalculatorExpected(
  scenario: ReferenceScenario,
): scenario is ReferenceScenario & {
  tongCalc: { expected: ReferenceExpected };
} {
  return scenario.tongCalc.expected !== null;
}
