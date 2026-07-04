import { GenericSkillFormula } from "./generic-skill";
import { StaticSkillFormula } from "./static-skill-formulas";
import { GuillotineCrossSkillFormula } from "./classes/guillotine-cross";
import { ArchMageSkillFormula } from "./classes/arch-mage";
import { WarlockSkillFormula } from "./classes/warlock";
import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "./skill-formula.types";

export class SkillFormulaRegistry {
  constructor(
    private readonly adapters: SkillFormulaAdapter[] = [
      new GuillotineCrossSkillFormula(),
      new ArchMageSkillFormula(),
      new WarlockSkillFormula(),
      new StaticSkillFormula(),
      new GenericSkillFormula(),
    ],
  ) {}

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    const adapter = this.adapters.find((candidate) =>
      candidate.supports(input.skill),
    );

    return (adapter ?? new GenericSkillFormula()).calculate(input);
  }
}
