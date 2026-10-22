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
  },
  TR_METALIC_FURY: (input) => {
    // C++: skillratio += -100 + 3850 * skill_lv; RE_LVL_DMOD(100);
    const ratio = 3850 * input.skillLevel;
    return {
      formulaId: "static:TR_METALIC_FURY",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  TR_RHYTHMICAL_WAVE: (input) => {
    // C++: skillratio += -100 + 250 + 3650 * skill_lv + TR_STAGE_MANNER * 25 + 5 * sstatus->spl; RE_LVL_DMOD(100);
    const stageMannerLv = input.character.learnedSkills?.["TR_STAGE_MANNER"] ?? 0;
    const ratio = 250 + 3650 * input.skillLevel + stageMannerLv * 25 + 5 * input.character.effectiveStats.spl;
    return {
      formulaId: "static:TR_RHYTHMICAL_WAVE",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
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
