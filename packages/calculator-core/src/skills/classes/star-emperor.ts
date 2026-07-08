import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  SJ_PROMINENCEKICK: (input) => ({
    formulaId: "static:SJ_PROMINENCEKICK", // Prominence Kick
    // C++: base_skillratio += 50 + 50 * skill_lv;
    multiplier: (150 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_SOLARBURST: (input) => ({
    formulaId: "static:SJ_SOLARBURST", // Solar Burst
    // C++: skillratio += 900 + 220 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((1000 + 220 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_FULLMOONKICK: (input) => ({
    formulaId: "static:SJ_FULLMOONKICK", // Full Moon Kick
    // C++: skillratio += 1000 + 100 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((1100 + 100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_NEWMOONKICK: (input) => ({
    formulaId: "static:SJ_NEWMOONKICK", // New Moon Kick
    // C++: base_skillratio += 600 + 100 * skill_lv;
    multiplier: (700 + 100 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_FALLINGSTAR_ATK: (input) => ({
    formulaId: "static:SJ_FALLINGSTAR_ATK", // Falling Star Attack
    // C++: skillratio += 100 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((100 + 100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_FLASHKICK: (input) => ({
    formulaId: "static:SJ_FLASHKICK", // Flash Kick
    // C++: No formula, base attack (100%)
    multiplier: 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class StarEmperorSkillFormula implements SkillFormulaAdapter {
  readonly id = "star-emperor";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
