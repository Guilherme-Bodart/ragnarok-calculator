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
  },
  ABC_CHAIN_REACTION_SHOT: (input) => {
    // C++: Initial shot (850 * skill_lv + 15 * con) + Secondary explosion (800 + 2550 * skill_lv + 15 * con); RE_LVL_DMOD(100);
    const ratio = 850 * input.skillLevel + 15 * input.character.effectiveStats.con;
    return {
      formulaId: "static:ABC_CHAIN_REACTION_SHOT",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  ABC_DEFT_STAB: (input) => {
    // C++: skillratio += -100 + 700 + 550 * skill_lv + 7 * sstatus->pow; RE_LVL_DMOD(100);
    const ratio = 700 + 550 * input.skillLevel + 7 * input.character.effectiveStats.pow;
    return {
      formulaId: "static:ABC_DEFT_STAB",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  ABC_ABYSS_SQUARE: (input) => {
    // C++: skillratio += -100 + 750 * skill_lv + 40 * ABC_MAGIC_SWORD_M * skill_lv + 5 * sstatus->spl; RE_LVL_DMOD(100);
    const masteryLv = input.character.learnedSkills?.["ABC_MAGIC_SWORD_M"] ?? 0;
    const ratio = (750 + 40 * masteryLv) * input.skillLevel + 5 * input.character.effectiveStats.spl;
    return {
      formulaId: "static:ABC_ABYSS_SQUARE",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  ABC_FRENZY_SHOT: (input) => {
    // C++: skillratio += -100 + 250 + 800 * skill_lv + 15 * sstatus->con; RE_LVL_DMOD(100);
    const ratio = 250 + 800 * input.skillLevel + 15 * input.character.effectiveStats.con;
    return {
      formulaId: "static:ABC_FRENZY_SHOT",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  ABC_HIT_AND_SLIDING: (input) => {
    // C++: skillratio += -100 + 3500 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    const ratio = 3500 * input.skillLevel + 5 * input.character.effectiveStats.pow;
    return {
      formulaId: "static:ABC_HIT_AND_SLIDING",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  ABC_CHASING_BREAK: (input) => {
    // C++: skillratio += -100 + 1550 + 450 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    const ratio = 1550 + 450 * input.skillLevel + 5 * input.character.effectiveStats.pow;
    return {
      formulaId: "static:ABC_CHASING_BREAK",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  ABC_CHASING_SHOT: (input) => {
    // C++: skillratio += -100 + 1500 + 700 * skill_lv + 5 * sstatus->con; RE_LVL_DMOD(100);
    const ratio = 1500 + 700 * input.skillLevel + 5 * input.character.effectiveStats.con;
    return {
      formulaId: "static:ABC_CHASING_SHOT",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  ABC_ABYSS_FLAME: (input) => {
    // C++: skillratio += -100 + 820 * skill_lv + 10 * sstatus->spl + 30 * skill_lv * ABC_MAGIC_SWORD_M; RE_LVL_DMOD(100);
    const masteryLv = input.character.learnedSkills?.["ABC_MAGIC_SWORD_M"] ?? 0;
    const ratio = (820 + 30 * masteryLv) * input.skillLevel + 10 * input.character.effectiveStats.spl;
    return {
      formulaId: "static:ABC_ABYSS_FLAME",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
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
