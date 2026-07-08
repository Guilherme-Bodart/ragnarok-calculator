import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  SC_FATALMENACE: (input) => ({
    formulaId: "static:SC_FATALMENACE",
    // C++: skillratio += 120 * skill_lv + sstatus->agi;
    multiplier: ((100 + 120 * input.skillLevel + input.character.effectiveStats.agi) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SC_TRIANGLESHOT: (input) => ({
    formulaId: "static:SC_TRIANGLESHOT",
    // C++: skillratio += -100 + 230 * skill_lv + 3 * sstatus->agi;
    multiplier: ((230 * input.skillLevel + 3 * input.character.effectiveStats.agi) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class ShadowChaserSkillFormula implements SkillFormulaAdapter {
  readonly id = "shadow-chaser";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
