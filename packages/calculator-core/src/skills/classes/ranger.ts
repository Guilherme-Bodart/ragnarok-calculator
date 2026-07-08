import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  RA_ARROWSTORM: (input) => ({
    formulaId: "static:RA_ARROWSTORM",
    // C++: skillratio += -100 + 200 + 250 * skill_lv; (Assuming Fear Breeze buff active)
    multiplier: ((200 + 250 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RA_AIMEDBOLT: (input) => ({
    formulaId: "static:RA_AIMEDBOLT",
    // C++: skillratio += -100 + 800 + 35 * skill_lv; (Assuming Fear Breeze buff active)
    multiplier: ((800 + 35 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class RangerSkillFormula implements SkillFormulaAdapter {
  readonly id = "ranger";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
