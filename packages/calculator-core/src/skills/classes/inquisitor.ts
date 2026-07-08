import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  IQ_THIRD_FLAME_BOMB: (input) => ({
    formulaId: "static:IQ_THIRD_FLAME_BOMB",
    // C++: skillratio += -100 + 650 * skill_lv + 10 * pow + max_hp * 20 / 100
    multiplier: ((650 * input.skillLevel + input.character.effectiveStats.pow * 10) * input.character.baseLevel) / 100 / 100,
    bonusFlatDamage: (input.character.maxHp * 20) / 100, // Using bonusFlatDamage field
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  IQ_THIRD_PUNISH: (input) => ({
    formulaId: "static:IQ_THIRD_PUNISH",
    // C++: skillratio += -100 + 450 + 1800 * skill_lv + 10 * pow
    multiplier: ((450 + 1800 * input.skillLevel + input.character.effectiveStats.pow * 10) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  IQ_THIRD_CONSECRATION: (input) => ({
    formulaId: "static:IQ_THIRD_CONSECRATION",
    // C++: skillratio += -100 + 1200 * skill_lv + 10 * pow
    multiplier: ((1200 * input.skillLevel + input.character.effectiveStats.pow * 10) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  IQ_SECOND_JUDGEMENT: (input) => ({
    formulaId: "static:IQ_SECOND_JUDGEMENT",
    // C++: skillratio += -100 + 2000 + 500 * skill_lv + 7 * pow
    multiplier: ((2000 + 500 * input.skillLevel + input.character.effectiveStats.pow * 7) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  IQ_SECOND_FLAME: (input) => ({
    formulaId: "static:IQ_SECOND_FLAME",
    // C++: skillratio += -100 + 200 + 2900 * skill_lv + 9 * pow
    multiplier: ((200 + 2900 * input.skillLevel + input.character.effectiveStats.pow * 9) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  IQ_SECOND_FAITH: (input) => ({
    formulaId: "static:IQ_SECOND_FAITH",
    // C++: skillratio += -100 + 100 + 2300 * skill_lv + 5 * pow
    multiplier: ((100 + 2300 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  IQ_MASSIVE_FLAME_BLASTER: (input) => ({
    formulaId: "static:IQ_MASSIVE_FLAME_BLASTER",
    // C++: skillratio += -100 + 2300 * skill_lv + 15 * pow
    multiplier: ((2300 * input.skillLevel + input.character.effectiveStats.pow * 15) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  IQ_OLEUM_SANCTUM: (input) => ({
    formulaId: "static:IQ_OLEUM_SANCTUM",
    // C++: skillratio += -100 + 500 + 2000 * skill_lv + 5 * pow
    multiplier: ((500 + 2000 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class InquisitorSkillFormula implements SkillFormulaAdapter {
  readonly id = "inquisitor";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
