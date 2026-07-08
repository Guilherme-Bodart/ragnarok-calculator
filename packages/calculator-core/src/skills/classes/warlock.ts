import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  WL_CRIMSONROCK: (input) => ({
    formulaId: "static:WL_CRIMSONROCK",
    // C++: skillratio += -100 + 700 + 600 * skill_lv
    multiplier: ((700 + 600 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WL_COMET: (input) => ({
    formulaId: "static:WL_COMET",
    // C++: skillratio += -100 + 2500 + 700 * skill_lv
    multiplier: ((2500 + 700 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WL_CHAINLIGHTNING: (input) => ({
    formulaId: "static:WL_CHAINLIGHTNING",
    // C++: skillratio += 400 + 100 * skill_lv
    multiplier: ((500 + 100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WL_EARTHSTRAIN: (input) => ({
    formulaId: "static:WL_EARTHSTRAIN",
    // C++: skillratio += -100 + 1000 + 600 * skill_lv
    multiplier: ((1000 + 600 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WL_TETRAVORTEX: (input) => ({
    formulaId: "static:WL_TETRAVORTEX",
    // C++: base_skillratio += -100 + 800 + 400 * skill_lv
    multiplier: ((800 + 400 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WL_JACKFROST: (input) => ({
    formulaId: "static:WL_JACKFROST",
    // C++: skillratio += -100 + 1000 + 300 * skill_lv
    multiplier: ((1000 + 300 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WL_SOULEXPANSION: (input) => ({
    formulaId: "static:WL_SOULEXPANSION",
    // C++: skillratio += -100 + 1000 + skill_lv * 200 + int
    multiplier: ((1000 + input.skillLevel * 200 + input.character.effectiveStats.int) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class WarlockSkillFormula implements SkillFormulaAdapter {
  readonly id = "warlock";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
