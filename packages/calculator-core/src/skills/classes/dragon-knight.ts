import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  DK_SERVANT_WEAPON: (input) => ({
    formulaId: "static:DK_SERVANT_WEAPON",
    // C++: skillratio += -100 + 600 + 850 * skill_lv + 5 * pow
    multiplier: ((600 + 850 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  DK_SERVANT_W_PHANTOM: (input) => ({
    formulaId: "static:DK_SERVANT_W_PHANTOM",
    // C++: skillratio += -100 + 200 + 300 * skill_lv + 5 * pow
    multiplier: ((200 + 300 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  DK_SERVANT_W_DEMON: (input) => ({
    formulaId: "static:DK_SERVANT_W_DEMON",
    // C++: skillratio += -100 + 500 * skill_lv + 5 * pow
    multiplier: ((500 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  DK_STORM_SLASH: (input) => ({
    formulaId: "static:DK_STORM_SLASH",
    // C++: skillratio += -100 + 300 + 750 * skill_lv + 5 * pow
    multiplier: ((300 + 750 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  DK_HACK_AND_SLASHER: (input) => ({
    formulaId: "static:DK_HACK_AND_SLASHER",
    // C++: skillratio += -100 + 400 + 1050 * skill_lv + 5 * pow
    multiplier: ((400 + 1050 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  DK_DRAGONIC_AURA: (input) => ({
    formulaId: "static:DK_DRAGONIC_AURA",
    // C++: skillratio += -100 + 2300 + 1750 * skill_lv + 5 * pow
    multiplier: ((2300 + 1750 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  DK_MADNESS_CRUSHER: (input) => ({
    formulaId: "static:DK_MADNESS_CRUSHER",
    // C++: skillratio += -100 + 700 + 1000 * skill_lv + 5 * pow
    multiplier: ((700 + 1000 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class DragonKnightSkillFormula implements SkillFormulaAdapter {
  readonly id = "dragon-knight";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
