import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  TK_TURNKICK: (input) => ({
    formulaId: "static:TK_TURNKICK",
    // C++: base_skillratio += 90 + 30 * skill_lv;
    multiplier: (190 + 30 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  TK_STORMKICK: (input) => ({
    formulaId: "static:TK_STORMKICK",
    // C++: base_skillratio += 60 + 20 * skill_lv;
    multiplier: (160 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  TK_JUMPKICK: (input) => ({
    formulaId: "static:TK_JUMPKICK",
    // C++: base_skillratio += -70 + 10 * skill_lv;
    multiplier: (30 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  TK_DOWNKICK: (input) => ({
    formulaId: "static:TK_DOWNKICK",
    // C++: base_skillratio += 60 + 20 * skill_lv;
    multiplier: (160 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  TK_COUNTER: (input) => ({
    formulaId: "static:TK_COUNTER",
    // C++: base_skillratio += 90 + 30 * skill_lv;
    multiplier: (190 + 30 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class TaekwonKidSkillFormula implements SkillFormulaAdapter {
  readonly id = "taekwon-kid";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
