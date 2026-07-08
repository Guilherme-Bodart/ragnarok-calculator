import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  GC_CROSSIMPACT: (input) => ({
    formulaId: "static:GC_CROSSIMPACT",
    // C++: skillratio += -100 + 1400 + 150 * skill_lv;
    multiplier: ((1400 + 150 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GC_ROLLINGCUTTER: (input) => ({
    formulaId: "static:GC_ROLLINGCUTTER",
    // C++: skillratio += -100 + 50 + 80 * skill_lv;
    multiplier: ((50 + 80 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GC_CROSSRIPPERSLASHER: (input) => ({
    formulaId: "static:GC_CROSSRIPPERSLASHER",
    // C++: skillratio += -100 + 80 * skill_lv + (sstatus->agi * 3);
    multiplier: ((80 * input.skillLevel + input.character.effectiveStats.agi * 3) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class GuillotineCrossSkillFormula implements SkillFormulaAdapter {
  readonly id = "guillotine-cross";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
