import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  LK_SPIRALPIERCE: (input) => ({
    formulaId: "static:LK_SPIRALPIERCE",
    // C++: skillratio += 50 + 50 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((150 + 50 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  LK_HEADCRUSH: (input) => ({
    formulaId: "static:LK_HEADCRUSH",
    // C++: base_skillratio += 40 * skill_lv;
    multiplier: (100 + 40 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  LK_JOINTBEAT: (input) => ({
    formulaId: "static:LK_JOINTBEAT",
    // C++: base_skillratio += -40 + 10 * skill_lv;
    multiplier: (60 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  PA_SHIELDCHAIN: (input) => ({
    formulaId: "static:PA_SHIELDCHAIN",
    // C++: skillratio = -100 + 300 + 200 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((200 + 200 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  PA_SACRIFICE: (input) => ({
    // Sacrifice normally deals exactly 9% of HP per hit, but for the sake of the formula:
    // It's a special skill. We will just return 100% and apply flat HP damage later, or apply it here as flat.
    formulaId: "static:PA_SACRIFICE",
    multiplier: 1.0,
    bonusFlatDamage: input.character.maxHp * 0.09,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class LordKnightPaladinSkillFormula implements SkillFormulaAdapter {
  readonly id = "lord-knight-paladin";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
