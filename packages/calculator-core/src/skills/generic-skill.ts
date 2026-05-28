import { getSkillMultiplier } from "../formulas";
import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "./skill-formula.types";

export class GenericSkillFormula implements SkillFormulaAdapter {
  readonly id = "generic";

  supports() {
    return true;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return {
      formulaId: this.id,
      multiplier: getSkillMultiplier(input.skill, input.skillLevel),
      hitCount:
        input.skill.hitCountByLevel?.[String(input.skillLevel)] ??
        input.skill.hitCount,
    };
  }
}
