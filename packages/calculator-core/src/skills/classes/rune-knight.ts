import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  RK_HUNDREDSPEAR: (input) => {
    // C++: skillratio += -100 + 600 + 200 * skill_lv + 50 * pc_checkskill(sd,LK_SPIRALPIERCE);
    const spiralLv = input.character.learnedSkills?.["LK_SPIRALPIERCE"] || 0;
    const ratio = 600 + 200 * input.skillLevel + 50 * spiralLv;
    return {
      formulaId: "static:RK_HUNDREDSPEAR",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  RK_WINDCUTTER: (input) => ({
    formulaId: "static:RK_WINDCUTTER",
    // C++: 250*lv (2h sword), 400*lv (spears), 300*lv (others). Defaulting to 300.
    multiplier: ((300 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RK_IGNITIONBREAK: (input) => ({
    formulaId: "static:RK_IGNITIONBREAK",
    // C++: skillratio += -100 + 450 * skill_lv;
    multiplier: ((450 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RK_SONICWAVE: (input) => ({
    formulaId: "static:RK_SONICWAVE",
    // C++: skillratio += -100 + 1050 + 150 * skill_lv;
    multiplier: ((1050 + 150 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RK_STORMBLAST: (input) => {
    // C++: skillratio += -100 + (((sd) ? pc_checkskill(sd,RK_RUNEMASTERY) : 0) + sstatus->str / 6) * 100;
    const masteryLv = input.character.learnedSkills?.["RK_RUNEMASTERY"] || 0;
    const str = input.character.effectiveStats.str;
    const ratio = (masteryLv + Math.floor(str / 6)) * 100;
    return {
      formulaId: "static:RK_STORMBLAST",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  }
};

export class RuneKnightSkillFormula implements SkillFormulaAdapter {
  readonly id = "rune-knight";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
