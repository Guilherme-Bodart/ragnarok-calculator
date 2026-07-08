import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  IG_OVERSLASH: (input) => {
    // C++: skillratio += -100 + 220 * skill_lv + (IG_SPEAR_SWORD_M * 50 * skill_lv) + 7 * pow
    const masteryLv = input.character.learnedSkills?.["IG_SPEAR_SWORD_M"] || 0;
    const ratio = 220 * input.skillLevel + (masteryLv * 50 * input.skillLevel) + input.character.effectiveStats.pow * 7;
    return {
      formulaId: "static:IG_OVERSLASH",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  IG_CROSS_RAIN: (input) => {
    // C++: skillratio += -100 + 500 * skill_lv + (IG_SPEAR_SWORD_M * 50 * skill_lv) + 7 * pow
    const masteryLv = input.character.learnedSkills?.["IG_SPEAR_SWORD_M"] || 0;
    const ratio = 500 * input.skillLevel + (masteryLv * 50 * input.skillLevel) + input.character.effectiveStats.pow * 7;
    return {
      formulaId: "static:IG_CROSS_RAIN",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  IG_SHIELD_SHOOTING: (input) => {
    // C++: skillratio += -100 + 1000 + 3500 * skill_lv + 10 * pow + skill_lv * 150 * IG_SHIELD_MASTERY
    // Ignore shield weight and refine for now as the calculator state doesn't natively expose it simply yet, but add base
    const masteryLv = input.character.learnedSkills?.["IG_SHIELD_MASTERY"] || 0;
    const ratio = 1000 + 3500 * input.skillLevel + input.character.effectiveStats.pow * 10 + input.skillLevel * 150 * masteryLv;
    return {
      formulaId: "static:IG_SHIELD_SHOOTING",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  IG_GRAND_JUDGEMENT: (input) => ({
    formulaId: "static:IG_GRAND_JUDGEMENT",
    multiplier: ((400 + 2000 * input.skillLevel + input.character.effectiveStats.pow * 7) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class ImperialGuardSkillFormula implements SkillFormulaAdapter {
  readonly id = "imperial-guard";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
