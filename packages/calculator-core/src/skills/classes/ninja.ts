import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  NJ_KIRIKAGE: (input) => ({
    formulaId: "static:NJ_KIRIKAGE",
    // C++: base_skillratio += -50 + 150 * skill_lv;
    multiplier: (50 + 150 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_HUUJIN: (input) => ({
    formulaId: "static:NJ_HUUJIN",
    // C++: base_skillratio += 50;
    multiplier: 150 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_HYOUSENSOU: (input) => ({
    formulaId: "static:NJ_HYOUSENSOU",
    // C++: base_skillratio -= 30;
    multiplier: 70 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_KOUENKA: (input) => ({
    formulaId: "static:NJ_KOUENKA",
    // C++: base_skillratio -= 10;
    multiplier: 90 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_BAKUENRYU: (input) => ({
    formulaId: "static:NJ_BAKUENRYU",
    // C++: base_skillratio += 50 + 150 * skill_lv;
    multiplier: (150 + 150 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_HYOUSYOURAKU: (input) => ({
    formulaId: "static:NJ_HYOUSYOURAKU",
    // C++: base_skillratio += 50 * skill_lv;
    multiplier: (100 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_KUNAI: (input) => ({
    formulaId: "static:NJ_KUNAI",
    // C++: base_skillratio += -100 + 100 * skill_lv;
    multiplier: (100 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_HUUMA: (input) => ({
    formulaId: "static:NJ_HUUMA",
    // C++: base_skillratio += -150 + 250 * skill_lv;
    multiplier: (250 * input.skillLevel - 50) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_SYURIKEN: (input) => ({
    formulaId: "static:NJ_SYURIKEN",
    // C++: base_skillratio += 5 * skill_lv; flat bonus: 4 * skill_lv + 3 * pc_checkskill(sd, NJ_TOBIDOUGU)
    multiplier: (100 + 5 * input.skillLevel) / 100,
    bonusFlatDamage:
      4 * input.skillLevel +
      3 * (input.character.learnedSkills?.["NJ_TOBIDOUGU"] ?? 0),
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_ZENYNAGE: (input) => ({
    formulaId: "static:NJ_ZENYNAGE",
    // C++: Fixed random damage 500~1000 * skill_lv (average 750 * skill_lv)
    multiplier: 0,
    bonusFlatDamage: 750 * input.skillLevel,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_KASUMIKIRI: (input) => ({
    formulaId: "static:NJ_KASUMIKIRI",
    // C++: base_skillratio += 20 * skill_lv;
    multiplier: (100 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_RAIGEKISAI: (input) => ({
    formulaId: "static:NJ_RAIGEKISAI",
    // C++: base_skillratio += 100 * skill_lv;
    multiplier: (100 + 100 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_KAMAITACHI: (input) => ({
    formulaId: "static:NJ_KAMAITACHI",
    // C++: base_skillratio += 100 * skill_lv;
    multiplier: (100 + 100 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_ISSEN: (input) => ({
    formulaId: "static:NJ_ISSEN",
    // C++: ATK + sstatus->hp * (8 + skill_lv) / 100
    multiplier: 1.0,
    bonusFlatDamage: Math.floor(
      ((input.character.maxHp ?? 0) * (8 + input.skillLevel)) / 100
    ),
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class NinjaSkillFormula implements SkillFormulaAdapter {
  readonly id = "ninja";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
