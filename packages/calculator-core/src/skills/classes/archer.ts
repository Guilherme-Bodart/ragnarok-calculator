import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  AC_DOUBLE: (input) => ({
    formulaId: "static:AC_DOUBLE",
    // C++: base_skillratio += 10 * (skill_lv - 1);
    // Which means 100 + 10*(lv-1) => 90 + 10*lv per hit. Since it hits twice, we'll keep the per-hit ratio and let hitCount handle it.
    multiplier: (90 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount, // Usually 2
    precision: "validated",
  }),
  AC_SHOWER: (input) => ({
    formulaId: "static:AC_SHOWER",
    // C++: base_skillratio += 50 + 10 * skill_lv;
    multiplier: (150 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class ArcherSkillFormula implements SkillFormulaAdapter {
  readonly id = "archer";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
