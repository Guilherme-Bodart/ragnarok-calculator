import { GenericSkillFormula } from "./generic-skill";
import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "./skill-formula.types";

export class SkillFormulaRegistry {
  constructor(
    private readonly adapters: SkillFormulaAdapter[] = [new GenericSkillFormula()],
  ) {}

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    const adapter = this.adapters.find((candidate) =>
      candidate.supports(input.skill),
    );

    return (adapter ?? new GenericSkillFormula()).calculate(input);
  }
}
