import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  AB_JUDEX: (input) => ({
    formulaId: "static:AB_JUDEX",
    // C++: skillratio += -100 + 300 + 70 * skill_lv;
    multiplier: ((300 + 70 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AB_ADORAMUS: (input) => ({
    formulaId: "static:AB_ADORAMUS",
    // C++: skillratio += -100 + 300 + 250 * skill_lv;
    multiplier: ((300 + 250 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class ArchbishopSkillFormula implements SkillFormulaAdapter {
  readonly id = "archbishop";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
