import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  WS_CARTTERMINATION: (input) => ({
    formulaId: "static:WS_CARTTERMINATION",
    // C++: base_skillratio += 80000 / i - 100; where i = 10 * (16 - skill_lv)
    multiplier: (80000 / (10 * (16 - input.skillLevel))) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class MastersmithWhitesmithSkillFormula implements SkillFormulaAdapter {
  readonly id = "mastersmith-whitesmith";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
