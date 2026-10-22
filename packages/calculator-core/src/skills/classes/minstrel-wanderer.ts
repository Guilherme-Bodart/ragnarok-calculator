import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  WM_SEVERE_RAINSTORM_MELEE: (input) => ({
    formulaId: "static:WM_SEVERE_RAINSTORM_MELEE",
    // C++: skillratio += -100 + 100 * skill_lv + (sstatus->dex / 300 + sstatus->agi / 200);
    // (Ignoring integer division precision loss from C++ for simplicity in JS, or we could Math.floor)
    multiplier: ((100 * input.skillLevel + Math.floor(input.character.effectiveStats.dex / 300) + Math.floor(input.character.effectiveStats.agi / 200)) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WM_METALICSOUND: (input) => ({
    formulaId: "static:WM_METALICSOUND",
    // C++: skillratio += -100 + 120 * skill_lv + 60 * 10; (assuming level 10 lesson)
    multiplier: ((600 + 120 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WM_REVERBERATION: (input) => ({
    formulaId: "static:WM_REVERBERATION",
    // C++: skillratio += -100 + 700 + 300 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((700 + 300 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WM_GREAT_ECHO: (input) => {
    // C++: skillratio += -100 + 250 + 500 * skill_lv + WM_LESSON * 50; RE_LVL_DMOD(100);
    const lessonLv = input.character.learnedSkills?.["WM_LESSON"] ?? 0;
    const ratio = 250 + 500 * input.skillLevel + lessonLv * 50;
    return {
      formulaId: "static:WM_GREAT_ECHO",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
};

export class MinstrelWandererSkillFormula implements SkillFormulaAdapter {
  readonly id = "minstrel-wanderer";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
