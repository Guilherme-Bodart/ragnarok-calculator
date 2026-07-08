import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  AM_ACIDTERROR: (input) => ({
    formulaId: "static:AM_ACIDTERROR",
    // C++: base_skillratio += -100 + 200 * skill_lv; (+100 for Learning Potion Lv10)
    multiplier: (100 + 200 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class AlchemistSkillFormula implements SkillFormulaAdapter {
  readonly id = "alchemist";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
