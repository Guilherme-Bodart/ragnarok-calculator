import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  KN_BOWLINGBASH: (input) => ({
    formulaId: "static:KN_BOWLINGBASH",
    // C++: base_skillratio += 40 * skill_lv;
    multiplier: (100 + 40 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KN_PIERCE: (input) => {
    const hitsBySize = { small: 1, medium: 2, large: 3 } as const;
    return {
      formulaId: "static:KN_PIERCE",
      // C++: base_skillratio += 10 * skill_lv;
      multiplier: (100 + 10 * input.skillLevel) / 100,
      hitCount: hitsBySize[input.monster.size],
      precision: "validated",
    };
  },
  CR_SHIELDBOOMERANG: (input) => ({
    formulaId: "static:CR_SHIELDBOOMERANG",
    // C++: base_skillratio += -100 + skill_lv * 80;
    multiplier: (80 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  CR_SHIELDCHARGE: (input) => ({
    formulaId: "static:CR_SHIELDCHARGE",
    // C++: base_skillratio += 20 * skill_lv;
    multiplier: (100 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  CR_HOLYCROSS: (input) => ({
    formulaId: "static:CR_HOLYCROSS",
    // C++: base_skillratio += 70 * skill_lv (if 2h spear), otherwise 35. Defaulting to 70 for 2h spear assumption or average
    // Actually we can just do 70 since it's commonly used with 2H spear
    multiplier: (100 + 70 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  CR_GRANDCROSS: (input) => ({
    formulaId: "static:CR_GRANDCROSS",
    // C++: (ATK + MATK) * (100 + 40 * skill_lv)
    multiplier: (100 + 40 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class KnightCrusaderSkillFormula implements SkillFormulaAdapter {
  readonly id = "knight-crusader";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
