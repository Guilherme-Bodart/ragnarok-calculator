import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  RA_ARROWSTORM: (input) => ({
    formulaId: "static:RA_ARROWSTORM",
    // C++: skillratio += -100 + 200 + 250 * skill_lv; (Assuming Fear Breeze buff active)
    multiplier: ((200 + 250 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RA_AIMEDBOLT: (input) => ({
    formulaId: "static:RA_AIMEDBOLT",
    // C++: skillratio += -100 + 800 + 35 * skill_lv; (Assuming Fear Breeze buff active)
    multiplier: ((800 + 35 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RA_CLUSTERBOMB: (input) => {
    // C++ clusterbomb.cpp + battle.cpp: base_skillratio += 100 + 100 * skill_lv (200 + 100 * skill_lv) + trap misc damage
    const researchLv = input.character.learnedSkills?.["RA_RESEARCHTRAP"] ?? 5;
    const trapBase = input.skillLevel * input.character.effectiveStats.dex + input.character.effectiveStats.int * 5;
    const trapBonus = Math.floor((((trapBase * input.character.baseLevel) / 100) * (20 * researchLv)) / 50);
    return {
      formulaId: "static:RA_CLUSTERBOMB",
      multiplier: (200 + 100 * input.skillLevel) / 100,
      bonusFlatDamage: trapBonus,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  RA_FIRINGTRAP: (input) => {
    const researchLv = input.character.learnedSkills?.["RA_RESEARCHTRAP"] ?? 5;
    const trapBase = input.skillLevel * input.character.effectiveStats.dex + input.character.effectiveStats.int * 5;
    const trapBonus = Math.floor((((trapBase * input.character.baseLevel) / 100) * (20 * researchLv)) / 100);
    return {
      formulaId: "static:RA_FIRINGTRAP",
      multiplier: 1.0,
      bonusFlatDamage: trapBonus,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  RA_ICEBOUNDTRAP: (input) => {
    const researchLv = input.character.learnedSkills?.["RA_RESEARCHTRAP"] ?? 5;
    const trapBase = input.skillLevel * input.character.effectiveStats.dex + input.character.effectiveStats.int * 5;
    const trapBonus = Math.floor((((trapBase * input.character.baseLevel) / 100) * (20 * researchLv)) / 100);
    return {
      formulaId: "static:RA_ICEBOUNDTRAP",
      multiplier: 1.0,
      bonusFlatDamage: trapBonus,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  RA_WUGSTRIKE: (input) => ({
    formulaId: "static:RA_WUGSTRIKE",
    // C++: base_skillratio += -100 + 200 * skill_lv;
    multiplier: (200 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RA_WUGBITE: (input) => ({
    formulaId: "static:RA_WUGBITE",
    // C++: base_skillratio += 300 + 200 * skill_lv (+ 100 at lv5); (starts at 100 => 400 + 200 * skill_lv)
    multiplier: (400 + 200 * input.skillLevel + (input.skillLevel === 5 ? 100 : 0)) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
};

export class RangerSkillFormula implements SkillFormulaAdapter {
  readonly id = "ranger";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
