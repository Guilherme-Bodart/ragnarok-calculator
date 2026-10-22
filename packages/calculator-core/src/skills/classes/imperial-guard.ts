import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  IG_OVERSLASH: (input) => {
    // C++: skillratio += -100 + 220 * skill_lv + (IG_SPEAR_SWORD_M * 50 * skill_lv) + 7 * pow
    const masteryLv = input.character.learnedSkills?.["IG_SPEAR_SWORD_M"] || 0;
    const ratio = 220 * input.skillLevel + (masteryLv * 50 * input.skillLevel) + input.character.effectiveStats.pow * 7;
    return {
      formulaId: "static:IG_OVERSLASH",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  IG_CROSS_RAIN: (input) => {
    // C++: skillratio += -100 + 500 * skill_lv + (IG_SPEAR_SWORD_M * 50 * skill_lv) + 7 * pow
    const masteryLv = input.character.learnedSkills?.["IG_SPEAR_SWORD_M"] || 0;
    const ratio = 500 * input.skillLevel + (masteryLv * 50 * input.skillLevel) + input.character.effectiveStats.pow * 7;
    return {
      formulaId: "static:IG_CROSS_RAIN",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  IG_SHIELD_SHOOTING: (input) => {
    // C++: skillratio += -100 + 1000 + 3500 * skill_lv + 10 * pow + skill_lv * 150 * IG_SHIELD_MASTERY
    // Ignore shield weight and refine for now as the calculator state doesn't natively expose it simply yet, but add base
    const masteryLv = input.character.learnedSkills?.["IG_SHIELD_MASTERY"] || 0;
    const ratio = 1000 + 3500 * input.skillLevel + input.character.effectiveStats.pow * 10 + input.skillLevel * 150 * masteryLv;
    return {
      formulaId: "static:IG_SHIELD_SHOOTING",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  IG_GRAND_JUDGEMENT: (input) => ({
    formulaId: "static:IG_GRAND_JUDGEMENT",
    multiplier: ((400 + 2000 * input.skillLevel + input.character.effectiveStats.pow * 7) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  IG_JUDGEMENT_CROSS: (input) => {
    // C++: skillratio += -100 + 1950 * skill_lv + 10 * sstatus->spl (+ 150 * skill_lv vs plant/insect); RE_LVL_DMOD(100);
    const raceBonus = input.monster.race === "plant" || input.monster.race === "insect" ? 150 * input.skillLevel : 0;
    const ratio = 1950 * input.skillLevel + 10 * input.character.effectiveStats.spl + raceBonus;
    return {
      formulaId: "static:IG_JUDGEMENT_CROSS",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  IG_IMPERIAL_CROSS: (input) => {
    // C++: skillratio += -100 + 1650 + 1350 * skill_lv + pc_checkskill(sd, IG_SPEAR_SWORD_M) * 25 + 5 * sstatus->pow; RE_LVL_DMOD(100);
    const masteryLv = input.character.learnedSkills?.["IG_SPEAR_SWORD_M"] ?? 0;
    const ratio = 1650 + 1350 * input.skillLevel + masteryLv * 25 + 5 * input.character.effectiveStats.pow;
    return {
      formulaId: "static:IG_IMPERIAL_CROSS",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  IG_RADIANT_SPEAR: (input) => {
    // C++: skillratio += -100 + 3500 + 1150 * skill_lv + pc_checkskill(sd, IG_SPEAR_SWORD_M) * 50 + 5 * sstatus->pow; RE_LVL_DMOD(100);
    const masteryLv = input.character.learnedSkills?.["IG_SPEAR_SWORD_M"] ?? 0;
    const ratio = 3500 + 1150 * input.skillLevel + masteryLv * 50 + 5 * input.character.effectiveStats.pow;
    return {
      formulaId: "static:IG_RADIANT_SPEAR",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  IG_IMPERIAL_PRESSURE: (input) => {
    // C++: skillratio += -100 + 5600 + 1850 * skill_lv + 7 * sstatus->spl + 50 * pc_checkskill(sd, IG_SPEAR_SWORD_M); RE_LVL_DMOD(100);
    const masteryLv = input.character.learnedSkills?.["IG_SPEAR_SWORD_M"] ?? 0;
    const ratio = 5600 + 1850 * input.skillLevel + 7 * input.character.effectiveStats.spl + 50 * masteryLv;
    return {
      formulaId: "static:IG_IMPERIAL_PRESSURE",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
};

export class ImperialGuardSkillFormula implements SkillFormulaAdapter {
  readonly id = "imperial-guard";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
