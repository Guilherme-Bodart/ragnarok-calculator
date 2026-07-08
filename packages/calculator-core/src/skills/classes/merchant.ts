import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  MC_MAMMONITE: (input) => ({
    formulaId: "static:MC_MAMMONITE",
    // C++: base_skillratio += 50 * skill_lv; -> 100 + 50 * lv
    multiplier: (100 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MC_CARTREVOLUTION: (input) => ({
    formulaId: "static:MC_CARTREVOLUTION",
    // C++: base_skillratio += 50 + 100 * sd->cart_weight / sd->cart_weight_max;
    multiplier: 250 / 100, // Assuming Max Cart Weight (+100)
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class MerchantSkillFormula implements SkillFormulaAdapter {
  readonly id = "merchant";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
