import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  SN_SHARPSHOOTING: (input) => ({
    formulaId: "static:SN_SHARPSHOOTING",
    // C++: skillratio += -100 + 300 + 300 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((300 + 300 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class SniperClownGypsySkillFormula implements SkillFormulaAdapter {
  readonly id = "sniper-clown-gypsy";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
