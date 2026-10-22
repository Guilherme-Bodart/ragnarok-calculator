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
    // C++: skillratio += -100 + 300 * skill_lv + 2 * sstatus->pow; RE_LVL_DMOD(100);
    const ratio = 300 * input.skillLevel + input.character.effectiveStats.pow * 2;
    return {
      formulaId: "static:SHC_ETERNAL_SLASH",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
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
  },
  SHC_FATAL_SHADOW_CROW: (input) => {
    // C++: skillratio += -100 + 1300 * skill_lv + 10 * sstatus->pow (+ 150 * skill_lv vs demihuman/dragon); RE_LVL_DMOD(100);
    const raceBonus = input.monster.race === "demihuman" || input.monster.race === "dragon" ? 150 * input.skillLevel : 0;
    const ratio = 1300 * input.skillLevel + 10 * input.character.effectiveStats.pow + raceBonus;
    return {
      formulaId: "static:SHC_FATAL_SHADOW_CROW",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  SHC_CROSS_SLASH: (input) => {
    // C++: skillratio += -100 + 300 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    const ratio = 300 * input.skillLevel + 5 * input.character.effectiveStats.pow;
    return {
      formulaId: "static:SHC_CROSS_SLASH",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
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
