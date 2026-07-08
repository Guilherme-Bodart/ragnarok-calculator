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
