import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  PR_MAGNUS: (input) => ({
    formulaId: "static:PR_MAGNUS",
    // C++: base_skillratio += 30;
    multiplier: 130 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  PR_TURNUNDEAD: (input) => ({
    formulaId: "static:PR_TURNUNDEAD",
    // C++ Renewal battle.cpp: 100% MATK + (baseLevel + int + skill_lv * 10) when not instant-killing
    multiplier: 1.0,
    bonusFlatDamage: input.character.baseLevel + input.character.effectiveStats.int + input.skillLevel * 10,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
};

export class HighPriestPriestSkillFormula implements SkillFormulaAdapter {
  readonly id = "high-priest-priest";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
