import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  SHC_SAVAGE_IMPACT: (input) => {
    // C++: skillratio += -100 + 105 * skill_lv + 5 * sstatus->pow;
    const ratio = 105 * input.skillLevel + input.character.effectiveStats.pow * 5;
    return {
      formulaId: "static:SHC_SAVAGE_IMPACT",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  SHC_ETERNAL_SLASH: (input) => {
    // Let's assume standard formula derived from similar pattern if C++ wasn't fully extracted, 
    // but eternal slash has a known pattern. If not present, fallback safely.
    // Assuming 100 + 150 * skillLevel + pow * 5 as a fallback.
    const ratio = 150 * input.skillLevel + input.character.effectiveStats.pow * 5;
    return {
      formulaId: "static:SHC_ETERNAL_SLASH",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "inferred",
    };
  },
  SHC_IMPACT_CRATER: (input) => {
    // C++: skillratio += -100 + 80 * skill_lv + 5 * sstatus->pow;
    const ratio = 80 * input.skillLevel + input.character.effectiveStats.pow * 5;
    return {
      formulaId: "static:SHC_IMPACT_CRATER",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  SHC_SHADOW_STAB: (input) => {
    // C++: skillratio += -100 + 650 * skill_lv + 5 * sstatus->pow;
    const ratio = 650 * input.skillLevel + input.character.effectiveStats.pow * 5;
    return {
      formulaId: "static:SHC_SHADOW_STAB",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  }
};

export class ShadowCrossSkillFormula implements SkillFormulaAdapter {
  readonly id = "shadow-cross";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
