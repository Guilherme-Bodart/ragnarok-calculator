import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  KO_JYUMONJIKIRI: (input) => ({
    formulaId: "static:KO_JYUMONJIKIRI",
    // C++: skillratio += -100 + 200 * skill_lv; RE_LVL_DMOD(120);
    multiplier: ((200 * input.skillLevel) * input.character.baseLevel) / 120 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_HUUMARANKA: (input) => ({
    formulaId: "static:KO_HUUMARANKA",
    // C++: skillratio += -100 + 150 * skill_lv + sstatus->str + (sd ? pc_checkskill(sd,NJ_HUUMA) * 100 : 0);
    // Assuming Throw Huuma Shuriken Lv5 (500)
    multiplier: (150 * input.skillLevel + input.character.effectiveStats.str + 500) / 100, // No RE_LVL_DMOD in C++
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_BAKURETSU: (input) => ({
    formulaId: "static:KO_BAKURETSU",
    // C++: skillratio += -100 + (sd ? pc_checkskill(sd,NJ_TOBIDOUGU) : 1) * (50 + sstatus->dex / 4) * skill_lv * 4 / 10;
    // RE_LVL_DMOD(120);
    // skillratio += 10 * (sd ? sd->status.job_level : 1);
    // Assuming Throwing Mastery Lv10
    multiplier: ((((10 * (50 + input.character.effectiveStats.dex / 4) * input.skillLevel * 0.4) * input.character.baseLevel) / 120) + (10 * 60)) / 100, // Assuming Job Lv 60
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_MAKIBISHI: (input) => ({
    formulaId: "static:KO_MAKIBISHI",
    // C++: base_skillratio += -100 + 20 * skill_lv;
    multiplier: (20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_HAPPOKUNAI: (input) => ({
    formulaId: "static:KO_HAPPOKUNAI",
    // No calculateSkillRatio override in C++, defaults to 100% per hit
    multiplier: 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_SETSUDAN: (input) => ({
    formulaId: "static:KO_SETSUDAN",
    // C++: skillratio += -100 + 100 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_MUCHANAGE: (input) => ({
    formulaId: "static:KO_MUCHANAGE",
    // C++: Throw Zeny / Kunai Splash base 100% + flat per level
    multiplier: 1.0,
    bonusFlatDamage: 100 * input.skillLevel,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_KAIHOU: (input) => ({
    formulaId: "static:KO_KAIHOU",
    // C++: skillratio += -100 + 200 * spirit_charms (10 charms = 2000); RE_LVL_DMOD(100);
    multiplier: (2000 * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_ZENKAI: (input) => ({
    formulaId: "static:KO_ZENKAI",
    // C++: Elemental seal ground effect
    multiplier: 1.0,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SS_SEKIENHOU: (input) => ({
    formulaId: "static:SS_SEKIENHOU",
    // C++: skillratio += -100 + 600 + 1100 * skill_lv + 70 * pc_checkskill(sd, SS_ANTENPOU) * skill_lv + 5 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((600 +
        1100 * input.skillLevel +
        70 * (input.character.learnedSkills?.["SS_ANTENPOU"] ?? 0) * input.skillLevel +
        5 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SS_REIKETSUHOU: (input) => ({
    formulaId: "static:SS_REIKETSUHOU",
    // C++: skillratio += -100 + 450 + 950 * skill_lv + 40 * pc_checkskill(sd, SS_ANTENPOU) * skill_lv + 5 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((450 +
        950 * input.skillLevel +
        40 * (input.character.learnedSkills?.["SS_ANTENPOU"] ?? 0) * input.skillLevel +
        5 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SS_RAIDENPOU: (input) => ({
    formulaId: "static:SS_RAIDENPOU",
    // C++: skillratio += -100 + 600 + 1100 * skill_lv + 70 * pc_checkskill(sd, SS_ANTENPOU) * skill_lv + 5 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((600 +
        1100 * input.skillLevel +
        70 * (input.character.learnedSkills?.["SS_ANTENPOU"] ?? 0) * input.skillLevel +
        5 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SS_KINRYUUHOU: (input) => ({
    formulaId: "static:SS_KINRYUUHOU",
    // C++: skillratio += -100 + 800 + 1500 * skill_lv + 15 * pc_checkskill(sd, SS_ANTENPOU) * skill_lv + 5 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((800 +
        1500 * input.skillLevel +
        15 * (input.character.learnedSkills?.["SS_ANTENPOU"] ?? 0) * input.skillLevel +
        5 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SS_SHIMIRU: (input) => ({
    formulaId: "static:SS_SHIMIRU",
    // C++: skillratio += -100 + 700 * skill_lv + 5 * sstatus->con; RE_LVL_DMOD(100);
    multiplier:
      ((700 * input.skillLevel + 5 * (input.character.effectiveStats.con ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SS_TOKEDASU: (input) => ({
    formulaId: "static:SS_TOKEDASU",
    // C++: skillratio += -100 + 700 * skill_lv + 5 * sstatus->con; RE_LVL_DMOD(100);
    multiplier:
      ((700 * input.skillLevel + 5 * (input.character.effectiveStats.con ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SS_KUNAIWAIKYOKU: (input) => ({
    formulaId: "static:SS_KUNAIWAIKYOKU",
    // C++: skillratio += -100 + 300 + 600 * skill_lv + pc_checkskill(sd, SS_KUNAIKUSSETSU) * 10 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((300 +
        600 * input.skillLevel +
        (input.character.learnedSkills?.["SS_KUNAIKUSSETSU"] ?? 0) * 10 * input.skillLevel +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SS_FUUMASHOUAKU: (input) => ({
    formulaId: "static:SS_FUUMASHOUAKU",
    // C++: skillratio += -100 + 850 + 350 * skill_lv + pc_checkskill(sd, SS_FUUMAKOUCHIKU) * 5 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((850 +
        350 * input.skillLevel +
        (input.character.learnedSkills?.["SS_FUUMAKOUCHIKU"] ?? 0) * 5 * input.skillLevel +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SS_FUUMAKOUCHIKU: (input) => ({
    formulaId: "static:SS_FUUMAKOUCHIKU",
    // C++: skillratio += -100 + 900 + 1750 * skill_lv + pc_checkskill(sd, SS_FUUMASHOUAKU) * 100 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((900 +
        1750 * input.skillLevel +
        (input.character.learnedSkills?.["SS_FUUMASHOUAKU"] ?? 0) * 100 * input.skillLevel +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SS_KAGEGARI: (input) => ({
    formulaId: "static:SS_KAGEGARI",
    // C++: skillratio += -100 + 600 + 900 * skill_lv + pc_checkskill(sd, SS_KAGEGISSEN) * 5 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((600 +
        900 * input.skillLevel +
        (input.character.learnedSkills?.["SS_KAGEGISSEN"] ?? 0) * 5 * input.skillLevel +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SS_KAGEGISSEN: (input) => ({
    formulaId: "static:SS_KAGEGISSEN",
    // C++: skillratio += -100 + 1500 + 950 * skill_lv + pc_checkskill(sd, SS_KAGENOMAI) * 150 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((1500 +
        950 * input.skillLevel +
        (input.character.learnedSkills?.["SS_KAGENOMAI"] ?? 0) * 150 * input.skillLevel +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class KagerouOboroSkillFormula implements SkillFormulaAdapter {
  readonly id = "kagerou-oboro";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
