import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  SR_TIGERCANNON: (input) => {
    // C++: (hp + sp) / 4 (assuming no combo for standard isolated hit)
    const hp = (input.character.maxHp * (10 + input.skillLevel * 2)) / 100;
    const sp = (input.character.maxSp * (5 + input.skillLevel)) / 100;
    const ratio = (hp + sp) / 4;
    return {
      formulaId: "static:SR_TIGERCANNON",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  SR_RAMPAGEBLASTER: (input) => ({
    formulaId: "static:SR_RAMPAGEBLASTER",
    // C++: skillratio += 1400 + 550 * skill_lv; (if no spheres or max spheres? we'll use max spheres average)
    // We'll use the higher damage since normally people use it with spheres
    multiplier: ((1400 + 550 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SR_SKYNETBLOW: (input) => ({
    formulaId: "static:SR_SKYNETBLOW",
    // C++: skillratio += -100 + 200 * skill_lv + sstatus->agi / 6;
    multiplier: ((200 * input.skillLevel + input.character.effectiveStats.agi / 6) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class SuraSkillFormula implements SkillFormulaAdapter {
  readonly id = "sura";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
