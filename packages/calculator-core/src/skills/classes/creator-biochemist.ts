import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  CR_ACIDDEMONSTRATION: (input) => ({
    formulaId: "static:CR_ACIDDEMONSTRATION",
    // C++: base_skillratio += -100 + 200 * skill_lv + sstatus->int_ + tstatus->vit;
    // (Assuming target VIT is handled elsewhere or omitted. For simplicity, treating target VIT as 0 here)
    multiplier: (100 + 200 * input.skillLevel + input.character.effectiveStats.int) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class CreatorBiochemistSkillFormula implements SkillFormulaAdapter {
  readonly id = "creator-biochemist";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
