import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  KO_JYUMONJIKIRI: (input) => ({
    formulaId: "static:KO_JYUMONJIKIRI",
    // C++: skillratio += -100 + 200 * skill_lv; RE_LVL_DMOD(120);
    multiplier: ((200 * input.skillLevel) * input.character.baseLevel) / 120 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_HUUMARANKA: (input) => ({
    formulaId: "static:KO_HUUMARANKA",
    // C++: skillratio += -100 + 150 * skill_lv + sstatus->str + (sd ? pc_checkskill(sd,NJ_HUUMA) * 100 : 0);
    // Assuming Throw Huuma Shuriken Lv5 (500)
    multiplier: (150 * input.skillLevel + input.character.effectiveStats.str + 500) / 100, // No RE_LVL_DMOD in C++
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_BAKURETSU: (input) => ({
    formulaId: "static:KO_BAKURETSU",
    // C++: skillratio += -100 + (sd ? pc_checkskill(sd,NJ_TOBIDOUGU) : 1) * (50 + sstatus->dex / 4) * skill_lv * 4 / 10;
    // RE_LVL_DMOD(120);
    // skillratio += 10 * (sd ? sd->status.job_level : 1);
    // Assuming Throwing Mastery Lv10
    multiplier: ((((10 * (50 + input.character.effectiveStats.dex / 4) * input.skillLevel * 0.4) * input.character.baseLevel) / 120) + (10 * 60)) / 100, // Assuming Job Lv 60
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_MAKIBISHI: (input) => ({
    formulaId: "static:KO_MAKIBISHI",
    // C++: base_skillratio += -100 + 20 * skill_lv;
    multiplier: (20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_HAPPOKUNAI: (input) => ({
    formulaId: "static:KO_HAPPOKUNAI",
    // No calculateSkillRatio override in C++, defaults to 100% per hit
    multiplier: 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class KagerouOboroSkillFormula implements SkillFormulaAdapter {
  readonly id = "kagerou-oboro";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
