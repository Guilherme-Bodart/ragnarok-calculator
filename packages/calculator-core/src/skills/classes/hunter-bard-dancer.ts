import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  HT_PHANTASMIC: (input) => ({
    formulaId: "static:HT_PHANTASMIC",
    // C++: base_skillratio += 400; (Renewal formula)
    multiplier: 500 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class HunterBardDancerSkillFormula implements SkillFormulaAdapter {
  readonly id = "hunter-bard-dancer";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
