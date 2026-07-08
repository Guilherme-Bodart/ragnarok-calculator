import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  SP_SPA: (input) => ({
    formulaId: "static:SP_SPA", // Espa
    // C++: skillratio += 400 + 250 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((500 + 250 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SP_SWHOO: (input) => ({
    formulaId: "static:SP_SWHOO", // Eswhoo
    // C++: skillratio += 1000 + 200 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((1100 + 200 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SP_SHA: (input) => ({
    formulaId: "static:SP_SHA", // Esha
    // C++: base_skillratio += -100 + 5 * skill_lv;
    multiplier: (5 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SP_CURSEEXPLOSION: (input) => ({
    formulaId: "static:SP_CURSEEXPLOSION", // Curse Explosion
    // Assuming target is NOT cursed by default (base: -100 + 400 + 100*lv = 400+100*lv)
    // C++: skillratio += -100 + 400 + 100 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((400 + 100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class SoulReaperSkillFormula implements SkillFormulaAdapter {
  readonly id = "soul-reaper";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
