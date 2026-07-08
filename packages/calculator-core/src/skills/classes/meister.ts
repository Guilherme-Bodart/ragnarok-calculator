import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  MT_RUSH_QUAKE: (input) => ({
    formulaId: "static:MT_RUSH_QUAKE",
    // C++: skillratio += -100 + 3600 * skill_lv + 10 * pow 
    multiplier: ((3600 * input.skillLevel + input.character.effectiveStats.pow * 10) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MT_SPARK_BLASTER: (input) => ({
    formulaId: "static:MT_SPARK_BLASTER",
    // C++: skillratio += -100 + 600 + 1400 * skill_lv + 5 * pow
    multiplier: ((600 + 1400 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MT_TRIPLE_LASER: (input) => ({
    formulaId: "static:MT_TRIPLE_LASER",
    // C++: skillratio += -100 + 650 + 1150 * skill_lv + 12 * pow
    multiplier: ((650 + 1150 * input.skillLevel + input.character.effectiveStats.pow * 12) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MT_MIGHTY_SMASH: (input) => ({
    formulaId: "static:MT_MIGHTY_SMASH",
    // C++: skillratio += -100 + 80 + 240 * skill_lv + 5 * pow
    multiplier: ((80 + 240 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class MeisterSkillFormula implements SkillFormulaAdapter {
  readonly id = "meister";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
