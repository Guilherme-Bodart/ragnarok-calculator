import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  ASC_METEORASSAULT: (input) => ({
    formulaId: "static:ASC_METEORASSAULT",
    // C++: skillratio += 100 + 120 * skill_lv;
    multiplier: ((200 + 120 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  ASC_BREAKER: (input) => ({
    formulaId: "static:ASC_BREAKER",
    // C++: skillratio += -100 + 150 * skill_lv + sstatus->str + sstatus->int_;
    multiplier: ((150 * input.skillLevel + input.character.effectiveStats.str + input.character.effectiveStats.int) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class AssassinCrossStalkerSkillFormula implements SkillFormulaAdapter {
  readonly id = "assassin-cross-stalker";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
