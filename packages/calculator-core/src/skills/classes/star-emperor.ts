import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  SJ_PROMINENCEKICK: (input) => ({
    formulaId: "static:SJ_PROMINENCEKICK", // Prominence Kick
    // C++: base_skillratio += 50 + 50 * skill_lv;
    multiplier: (150 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_SOLARBURST: (input) => ({
    formulaId: "static:SJ_SOLARBURST", // Solar Burst
    // C++: skillratio += 900 + 220 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((1000 + 220 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_FULLMOONKICK: (input) => ({
    formulaId: "static:SJ_FULLMOONKICK", // Full Moon Kick
    // C++: skillratio += 1000 + 100 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((1100 + 100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_NEWMOONKICK: (input) => ({
    formulaId: "static:SJ_NEWMOONKICK", // New Moon Kick
    // C++: base_skillratio += 600 + 100 * skill_lv;
    multiplier: (700 + 100 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_FALLINGSTAR_ATK: (input) => ({
    formulaId: "static:SJ_FALLINGSTAR_ATK", // Falling Star Attack
    // C++: skillratio += 100 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((100 + 100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_FLASHKICK: (input) => ({
    formulaId: "static:SJ_FLASHKICK", // Flash Kick
    // C++: No formula, base attack (100%)
    multiplier: 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_NOVAEXPLOSING: (input) => ({
    formulaId: "static:SJ_NOVAEXPLOSING",
    // C++: base_skillratio += 1900 + 400 * skill_lv;
    multiplier: (2000 + 400 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_BOOKOFCREATINGSTAR: (input) => ({
    formulaId: "static:SJ_BOOKOFCREATINGSTAR",
    // C++: 100% baseline
    multiplier: 1.0,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SKE_RISING_SUN: (input) => ({
    formulaId: "static:SKE_RISING_SUN",
    // C++: skillratio += -100 + 500 + 600 * skill_lv + pc_checkskill(sd, SKE_SKY_MASTERY) * 5 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((500 +
        600 * input.skillLevel +
        (input.character.learnedSkills?.["SKE_SKY_MASTERY"] ?? 0) * 5 * input.skillLevel +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SKE_NOON_BLAST: (input) => ({
    formulaId: "static:SKE_NOON_BLAST",
    // C++: skillratio += -100 + 1500 + 1250 * skill_lv + pc_checkskill(sd, SKE_SKY_MASTERY) * 5 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((1500 +
        1250 * input.skillLevel +
        (input.character.learnedSkills?.["SKE_SKY_MASTERY"] ?? 0) * 5 * input.skillLevel +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SKE_STAR_BURST: (input) => ({
    formulaId: "static:SKE_STAR_BURST",
    // C++: skillratio += -100 + 500 + 400 * skill_lv + pc_checkskill(sd, SKE_SKY_MASTERY) * 3 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((500 +
        400 * input.skillLevel +
        (input.character.learnedSkills?.["SKE_SKY_MASTERY"] ?? 0) * 3 * input.skillLevel +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SKE_SUNSET_BLAST: (input) => ({
    formulaId: "static:SKE_SUNSET_BLAST",
    // C++: skillratio += -100 + 950 + 400 * skill_lv + pc_checkskill(sd, SKE_SKY_MASTERY) * 5 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((950 +
        400 * input.skillLevel +
        (input.character.learnedSkills?.["SKE_SKY_MASTERY"] ?? 0) * 5 * input.skillLevel +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SKE_ALL_IN_THE_SKY: (input) => ({
    formulaId: "static:SKE_ALL_IN_THE_SKY",
    // C++: skillratio += -100 + 250 + 1200 * skill_lv + 5 * sstatus->pow;
    multiplier:
      (250 + 1200 * input.skillLevel + 5 * (input.character.effectiveStats.pow ?? 0)) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SKE_SKY_MOON: (input) => ({
    formulaId: "static:SKE_SKY_MOON",
    // C++: skillratio += -100 + 1200 + 450 * skill_lv + pc_checkskill(sd, SKE_SKY_MASTERY) * 9 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((1200 +
        450 * input.skillLevel +
        (input.character.learnedSkills?.["SKE_SKY_MASTERY"] ?? 0) * 9 * input.skillLevel +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SKE_STAR_LIGHT_KICK: (input) => ({
    formulaId: "static:SKE_STAR_LIGHT_KICK",
    // C++: skillratio += -100 + 400 + 200 * skill_lv + pc_checkskill(sd, SKE_SKY_MASTERY) * 5 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((400 +
        200 * input.skillLevel +
        (input.character.learnedSkills?.["SKE_SKY_MASTERY"] ?? 0) * 5 * input.skillLevel +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class StarEmperorSkillFormula implements SkillFormulaAdapter {
  readonly id = "star-emperor";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
