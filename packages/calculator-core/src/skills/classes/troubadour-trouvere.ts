import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  TR_ROSEBLOSSOM: (input) => {
    // C++: skillratio += -100 + 200 + 2000 * skill_lv + 3 * sstatus->con;
    const ratio = 200 + 2000 * input.skillLevel + input.character.effectiveStats.con * 3;
    return {
      formulaId: "static:TR_ROSEBLOSSOM",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  TR_RHYTHMSHOOTING: (input) => {
    // C++: skillratio += -100 + 550 + 950 * skill_lv + 5 * sstatus->con;
    const ratio = 550 + 950 * input.skillLevel + input.character.effectiveStats.con * 5;
    return {
      formulaId: "static:TR_RHYTHMSHOOTING",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  }
};

export class TroubadourTrouvereSkillFormula implements SkillFormulaAdapter {
  readonly id = "troubadour-trouvere";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
