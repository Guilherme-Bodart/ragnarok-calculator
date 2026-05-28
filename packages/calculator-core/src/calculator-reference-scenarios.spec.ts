import { describe, expect, it } from "vitest";
import { calculateDamageFromDataset } from "./calculate-damage-from-dataset";
import { createCalculatorDatasetFromRathenaNormalized } from "./datasets";
import reference from "./reference-scenarios/starter-reference.json";

const dataset = createCalculatorDatasetFromRathenaNormalized(reference.dataset);

describe("calculator reference scenarios", () => {
  it.each(reference.cases)("$id matches the local reference JSON", (scenario) => {
    const result = calculateDamageFromDataset(
      {
        ...reference.baseInput,
        ...scenario.input,
      },
      dataset,
    );

    expect(result.damage).toMatchObject(scenario.expected.damage);
    expect(Object.fromEntries(result.breakdown.map((line) => [line.key, line.value])))
      .toMatchObject(scenario.expected.breakdown);
  });

  it.each(reference.cases.filter((scenario) => scenario.tongCalc.expected))(
    "$id matches confirmed Tong Calculator values",
    (scenario) => {
      const result = calculateDamageFromDataset(
        {
          ...reference.baseInput,
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
