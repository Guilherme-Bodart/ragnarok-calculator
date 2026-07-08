import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  ABC_ABYSS_STRIKE: (input) => {
    // C++: skillratio += -100 + 2650 * skill_lv + 10 * sstatus->spl; (Omega Abyss Strike)
    const ratio = 2650 * input.skillLevel + input.character.effectiveStats.spl * 10;
    return {
      formulaId: "static:ABC_ABYSS_STRIKE",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  ABC_UNLUCKY_RUSH: (input) => {
    // C++: skillratio += -100 + 100 + 300 * skill_lv + 5 * sstatus->pow;
    const ratio = 100 + 300 * input.skillLevel + input.character.effectiveStats.pow * 5;
    return {
      formulaId: "static:ABC_UNLUCKY_RUSH",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  }
};

export class AbyssChaserSkillFormula implements SkillFormulaAdapter {
  readonly id = "abyss-chaser";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
