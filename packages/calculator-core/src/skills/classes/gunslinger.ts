import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  GS_TRIPLEACTION: (input) => ({
    formulaId: "static:GS_TRIPLEACTION",
    // C++: base_skillratio += 50 * skill_lv;
    multiplier: (100 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GS_TRACKING: (input) => ({
    formulaId: "static:GS_TRACKING",
    // C++: base_skillratio += 100 * (skill_lv + 1);
    multiplier: (100 + 100 * (input.skillLevel + 1)) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GS_SPREADATTACK: (input) => ({
    formulaId: "static:GS_SPREADATTACK",
    // C++: base_skillratio += 30 * skill_lv;
    multiplier: (100 + 30 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GS_RAPIDSHOWER: (input) => ({
    formulaId: "static:GS_RAPIDSHOWER",
    // C++: base_skillratio += 400 + 50 * skill_lv;
    multiplier: (100 + 400 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GS_PIERCINGSHOT: (input) => ({
    formulaId: "static:GS_PIERCINGSHOT",
    // C++: base_skillratio += 150 + 30 * skill_lv; (Assuming Bullseye Max)
    multiplier: (100 + 150 + 30 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GS_DESPERADO: (input) => ({
    formulaId: "static:GS_DESPERADO",
    // C++: base_skillratio += 50 * (skill_lv - 1);
    multiplier: (100 + 50 * (input.skillLevel - 1)) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class GunslingerSkillFormula implements SkillFormulaAdapter {
  readonly id = "gunslinger";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
