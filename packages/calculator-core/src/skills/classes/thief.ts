import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  TF_SANDATTACK: (input) => ({
    formulaId: "static:TF_SANDATTACK",
    // C++: base_skillratio += 30;
    multiplier: 130 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  TF_SPRINKLESAND: (input) => ({
    formulaId: "static:TF_SPRINKLESAND",
    // C++: base_skillratio += 30;
    multiplier: 130 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  TF_POISON: (input) => ({
    formulaId: "static:TF_POISON",
    // C++ battle.cpp: 100% ATK + 15 * skill_lv mastery damage
    multiplier: 1.0,
    bonusFlatDamage: 15 * input.skillLevel,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  TF_THROWSTONE: (input) => ({
    formulaId: "static:TF_THROWSTONE",
    // C++ battle.cpp: fixed 50 damage for players
    multiplier: 0,
    bonusFlatDamage: 50,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
};

export class ThiefSkillFormula implements SkillFormulaAdapter {
  readonly id = "thief";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
