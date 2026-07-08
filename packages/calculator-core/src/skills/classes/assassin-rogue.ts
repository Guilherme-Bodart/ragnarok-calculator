import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  AS_SONICBLOW: (input) => ({
    formulaId: "static:AS_SONICBLOW",
    // C++: base_skillratio += 100 + 100 * skill_lv;
    multiplier: (200 + 100 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AS_VENOMSPLATTER: (input) => ({
    formulaId: "static:AS_VENOMSPLATTER",
    // C++: base_skillratio += -100 + 400 + 100 * skill_lv;
    multiplier: (400 + 100 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AS_GRIMTOOTH: (input) => ({
    formulaId: "static:AS_GRIMTOOTH",
    // C++: base_skillratio += 20 * skill_lv;
    multiplier: (100 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RG_BACKSTAP: (input) => ({
    formulaId: "static:RG_BACKSTAP",
    // C++: base_skillratio += 200 + 40 * skill_lv; (Does not have RE_LVL_DMOD)
    multiplier: (300 + 40 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RG_RAID: (input) => ({
    formulaId: "static:RG_RAID",
    // C++: base_skillratio += -100 + 50 + skill_lv * 150; (Does not have RE_LVL_DMOD)
    multiplier: (50 + 150 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class AssassinRogueSkillFormula implements SkillFormulaAdapter {
  readonly id = "assassin-rogue";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
