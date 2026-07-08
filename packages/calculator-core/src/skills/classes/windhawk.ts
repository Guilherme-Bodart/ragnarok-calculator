import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  WH_GALESTORM: (input) => {
    // C++: skillratio += -100 + 1350 * skill_lv + 10 * sstatus->con;
    const ratio = 1350 * input.skillLevel + input.character.effectiveStats.con * 10;
    return {
      formulaId: "static:WH_GALESTORM",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  WH_CRESCIVE_BOLT: (input) => {
    // C++: skillratio += -100 + 500 + 1300 * skill_lv + 5 * sstatus->con;
    const ratio = 500 + 1300 * input.skillLevel + input.character.effectiveStats.con * 5;
    return {
      formulaId: "static:WH_CRESCIVE_BOLT",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  }
};

export class WindhawkSkillFormula implements SkillFormulaAdapter {
  readonly id = "windhawk";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
