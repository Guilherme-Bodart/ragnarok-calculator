import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  BO_EXPLOSIVE_POWDER: (input) => ({
    formulaId: "static:BO_EXPLOSIVE_POWDER",
    // C++: skillratio += -100 + 500 + 650 * skill_lv + 5 * pow
    multiplier: ((500 + 650 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  BO_MAYHEMIC_THORNS: (input) => ({
    formulaId: "static:BO_MAYHEMIC_THORNS",
    // C++: skillratio += -100 + 200 + 340 * skill_lv + 5 * pow
    multiplier: ((200 + 340 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  BO_MYSTERY_POWDER: (input) => ({
    formulaId: "static:BO_MYSTERY_POWDER",
    // C++: skillratio += -100 + 1500 + 4000 * skill_lv + 5 * pow
    multiplier: ((1500 + 4000 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  BO_ACIDIFIED_ZONE_FIRE: (input) => ({
    formulaId: "static:BO_ACIDIFIED_ZONE_FIRE",
    // C++: skillratio += -100 + 400 * skill_lv + 5 * pow
    multiplier: ((400 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  BO_ACIDIFIED_ZONE_WATER: (input) => ({
    formulaId: "static:BO_ACIDIFIED_ZONE_WATER",
    multiplier: ((400 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  BO_ACIDIFIED_ZONE_GROUND: (input) => ({
    formulaId: "static:BO_ACIDIFIED_ZONE_GROUND",
    multiplier: ((400 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  BO_ACIDIFIED_ZONE_WIND: (input) => ({
    formulaId: "static:BO_ACIDIFIED_ZONE_WIND",
    multiplier: ((400 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class BioloSkillFormula implements SkillFormulaAdapter {
  readonly id = "biolo";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
