import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  SP_SPA: (input) => ({
    formulaId: "static:SP_SPA", // Espa
    // C++: skillratio += 400 + 250 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((500 + 250 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SP_SWHOO: (input) => ({
    formulaId: "static:SP_SWHOO", // Eswhoo
    // C++: skillratio += 1000 + 200 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((1100 + 200 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SP_SHA: (input) => ({
    formulaId: "static:SP_SHA", // Esha
    // C++: base_skillratio += -100 + 5 * skill_lv;
    multiplier: (5 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SP_CURSEEXPLOSION: (input) => ({
    formulaId: "static:SP_CURSEEXPLOSION", // Curse Explosion
    // Assuming target is NOT cursed by default (base: -100 + 400 + 100*lv = 400+100*lv)
    // C++: skillratio += -100 + 400 + 100 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((400 + 100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SP_SOULEXPLOSION: (input) => ({
    formulaId: "static:SP_SOULEXPLOSION",
    // C++: skillratio += -100 + 900 + 150 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((900 + 150 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SOA_TALISMAN_OF_SOUL_STEALING: (input) => ({
    formulaId: "static:SOA_TALISMAN_OF_SOUL_STEALING",
    // C++: skillratio += -100 + 500 + 1250 * skill_lv + ((pc_checkskill(sd, SOA_TALISMAN_MASTERY) * 7 + pc_checkskill(sd, SOA_SOUL_MASTERY) * 7) * skill_lv) + 3 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((500 +
        1250 * input.skillLevel +
        ((input.character.learnedSkills?.["SOA_TALISMAN_MASTERY"] ?? 0) * 7 +
          (input.character.learnedSkills?.["SOA_SOUL_MASTERY"] ?? 0) * 7) *
          input.skillLevel +
        3 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SOA_TALISMAN_OF_BLUE_DRAGON: (input) => ({
    formulaId: "static:SOA_TALISMAN_OF_BLUE_DRAGON",
    // C++: skillratio += -100 + 850 + 2250 * skill_lv + pc_checkskill(sd, SOA_TALISMAN_MASTERY) * 15 * skill_lv + 5 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((850 +
        2250 * input.skillLevel +
        (input.character.learnedSkills?.["SOA_TALISMAN_MASTERY"] ?? 0) * 15 * input.skillLevel +
        5 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SOA_TALISMAN_OF_RED_PHOENIX: (input) => ({
    formulaId: "static:SOA_TALISMAN_OF_RED_PHOENIX",
    // C++: skillratio += -100 + 1400 + 1450 * skill_lv + pc_checkskill(sd, SOA_TALISMAN_MASTERY) * 15 * skill_lv + 5 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((1400 +
        1450 * input.skillLevel +
        (input.character.learnedSkills?.["SOA_TALISMAN_MASTERY"] ?? 0) * 15 * input.skillLevel +
        5 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SOA_TALISMAN_OF_BLACK_TORTOISE: (input) => ({
    formulaId: "static:SOA_TALISMAN_OF_BLACK_TORTOISE",
    // C++: skillratio += -100 + 2150 + 1600 * skill_lv + pc_checkskill(sd, SOA_TALISMAN_MASTERY) * 15 * skill_lv + 5 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((2150 +
        1600 * input.skillLevel +
        (input.character.learnedSkills?.["SOA_TALISMAN_MASTERY"] ?? 0) * 15 * input.skillLevel +
        5 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SOA_TALISMAN_OF_FOUR_BEARING_GOD: (input) => ({
    formulaId: "static:SOA_TALISMAN_OF_FOUR_BEARING_GOD",
    // C++: skillratio += -100 + 50 + 250 * skill_lv + pc_checkskill(sd, SOA_TALISMAN_MASTERY) * 15 * skill_lv + 5 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((50 +
        250 * input.skillLevel +
        (input.character.learnedSkills?.["SOA_TALISMAN_MASTERY"] ?? 0) * 15 * input.skillLevel +
        5 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SOA_CIRCLE_OF_DIRECTIONS_AND_ELEMENTALS: (input) => ({
    formulaId: "static:SOA_CIRCLE_OF_DIRECTIONS_AND_ELEMENTALS",
    // C++: skillratio += -100 + 500 + 2000 * skill_lv + ((pc_checkskill(sd, SOA_TALISMAN_MASTERY) * 15 + pc_checkskill(sd, SOA_SOUL_MASTERY) * 15) * skill_lv) + 5 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((500 +
        2000 * input.skillLevel +
        ((input.character.learnedSkills?.["SOA_TALISMAN_MASTERY"] ?? 0) * 15 +
          (input.character.learnedSkills?.["SOA_SOUL_MASTERY"] ?? 0) * 15) *
          input.skillLevel +
        5 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class SoulReaperSkillFormula implements SkillFormulaAdapter {
  readonly id = "soul-reaper";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
