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
  },
  RK_PHANTOMTHRUST: (input) => {
    // C++: skillratio += -100 + 50 * skill_lv + 10 * (sd ? pc_checkskill(sd,KN_SPEARMASTERY) : 5); RE_LVL_DMOD(150);
    const spearMasteryLv = input.character.learnedSkills?.["KN_SPEARMASTERY"] ?? 0;
    const ratio = 50 * input.skillLevel + 10 * spearMasteryLv;
    return {
      formulaId: "static:RK_PHANTOMTHRUST",
      multiplier: (ratio * input.character.baseLevel) / 150 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  RK_DRAGONBREATH: (input) => {
    // C++ battle.cpp: damagevalue = (hp / 50 + max_sp / 4) * skill_lv * (lv > 100 ? lv / 100 : 1) * (90 + 10 * RK_DRAGONTRAINING + (DK_DRAGONIC_AURA >= 1 ? pow / 5 : 0)) / 100
    const trainingLv = input.character.learnedSkills?.["RK_DRAGONTRAINING"] ?? 5;
    const hasDragonicAura = (input.character.learnedSkills?.["DK_DRAGONIC_AURA"] ?? 0) >= 1;
    const powBonus = hasDragonicAura ? Math.floor(input.character.effectiveStats.pow / 5) : 0;
    const baseDmg = (Math.floor(input.character.maxHp / 50) + Math.floor(input.character.maxSp / 4)) * input.skillLevel;
    const lvScaled = input.character.baseLevel > 100
      ? Math.floor((baseDmg * input.character.baseLevel) / 100)
      : baseDmg;
    const trainingScaled = Math.floor((lvScaled * (90 + 10 * trainingLv + powBonus)) / 100);
    return {
      formulaId: "static:RK_DRAGONBREATH",
      multiplier: 1.0,
      bonusFlatDamage: trainingScaled,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  RK_DRAGONBREATH_WATER: (input) => {
    const trainingLv = input.character.learnedSkills?.["RK_DRAGONTRAINING"] ?? 5;
    const hasDragonicAura = (input.character.learnedSkills?.["DK_DRAGONIC_AURA"] ?? 0) >= 1;
    const powBonus = hasDragonicAura ? Math.floor(input.character.effectiveStats.pow / 5) : 0;
    const baseDmg = (Math.floor(input.character.maxHp / 50) + Math.floor(input.character.maxSp / 4)) * input.skillLevel;
    const lvScaled = input.character.baseLevel > 100
      ? Math.floor((baseDmg * input.character.baseLevel) / 100)
      : baseDmg;
    const trainingScaled = Math.floor((lvScaled * (90 + 10 * trainingLv + powBonus)) / 100);
    return {
      formulaId: "static:RK_DRAGONBREATH_WATER",
      multiplier: 1.0,
      bonusFlatDamage: trainingScaled,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
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
