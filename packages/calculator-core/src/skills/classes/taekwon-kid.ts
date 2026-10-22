import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  TK_TURNKICK: (input) => ({
    formulaId: "static:TK_TURNKICK",
    // C++: base_skillratio += 90 + 30 * skill_lv;
    multiplier: (190 + 30 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  TK_STORMKICK: (input) => ({
    formulaId: "static:TK_STORMKICK",
    // C++: base_skillratio += 60 + 20 * skill_lv;
    multiplier: (160 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  TK_JUMPKICK: (input) => ({
    formulaId: "static:TK_JUMPKICK",
    // C++: base_skillratio += -70 + 10 * skill_lv;
    multiplier: (30 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  TK_DOWNKICK: (input) => ({
    formulaId: "static:TK_DOWNKICK",
    // C++: base_skillratio += 60 + 20 * skill_lv;
    multiplier: (160 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  TK_COUNTER: (input) => ({
    formulaId: "static:TK_COUNTER",
    // C++: base_skillratio += 90 + 30 * skill_lv;
    multiplier: (190 + 30 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  HN_DOUBLEBOWLINGBASH: (input) => ({
    formulaId: "static:HN_DOUBLEBOWLINGBASH",
    // C++: skillratio += -100 + 250 + 400 * skill_lv + pc_checkskill(sd, HN_SELFSTUDY_TATICS) * 3 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((250 +
        400 * input.skillLevel +
        (input.character.learnedSkills?.["HN_SELFSTUDY_TATICS"] ?? 0) * 3 * input.skillLevel +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  HN_SHIELD_CHAIN_RUSH: (input) => ({
    formulaId: "static:HN_SHIELD_CHAIN_RUSH",
    // C++: skillratio += -100 + 600 + 1300 * skill_lv + pc_checkskill(sd, HN_SELFSTUDY_TATICS) * 3 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((600 +
        1300 * input.skillLevel +
        (input.character.learnedSkills?.["HN_SELFSTUDY_TATICS"] ?? 0) * 3 * input.skillLevel +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  HN_METEOR_STORM_BUSTER: (input) => ({
    formulaId: "static:HN_METEOR_STORM_BUSTER",
    // C++: skillratio += -100 + 450 + 160 * skill_lv + pc_checkskill(sd, HN_SELFSTUDY_SOCERY) * 5 * skill_lv + 3 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((450 +
        160 * input.skillLevel +
        (input.character.learnedSkills?.["HN_SELFSTUDY_SOCERY"] ?? 0) * 5 * input.skillLevel +
        3 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  HN_JUPITEL_THUNDER_STORM: (input) => ({
    formulaId: "static:HN_JUPITEL_THUNDER_STORM",
    // C++: skillratio += -100 + 1800 * skill_lv + pc_checkskill(sd, HN_SELFSTUDY_SOCERY) * 3 * skill_lv + 3 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((1800 * input.skillLevel +
        (input.character.learnedSkills?.["HN_SELFSTUDY_SOCERY"] ?? 0) * 3 * input.skillLevel +
        3 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  HN_JACK_FROST_NOVA: (input) => ({
    formulaId: "static:HN_JACK_FROST_NOVA",
    // C++: skillratio += -100 + 400 + 500 * skill_lv + pc_checkskill(sd, HN_SELFSTUDY_SOCERY) * 3 * skill_lv + 4 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((400 +
        500 * input.skillLevel +
        (input.character.learnedSkills?.["HN_SELFSTUDY_SOCERY"] ?? 0) * 3 * input.skillLevel +
        4 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  HN_MEGA_SONIC_BLOW: (input) => ({
    formulaId: "static:HN_MEGA_SONIC_BLOW",
    // C++: skillratio += -100 + 900 + 750 * skill_lv + pc_checkskill(sd, HN_SELFSTUDY_TATICS) * 5 * skill_lv + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((900 +
        750 * input.skillLevel +
        (input.character.learnedSkills?.["HN_SELFSTUDY_TATICS"] ?? 0) * 5 * input.skillLevel +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  HN_SPIRAL_PIERCE_MAX: (input) => ({
    formulaId: "static:HN_SPIRAL_PIERCE_MAX",
    // C++: skillratio += -100 + 1000 + 1500 * skill_lv + pc_checkskill(sd, HN_SELFSTUDY_TATICS) * 3 * skill_lv + 5 * sstatus->pow; * size_mod; RE_LVL_DMOD(100);
    multiplier:
      (((1000 +
        1500 * input.skillLevel +
        (input.character.learnedSkills?.["HN_SELFSTUDY_TATICS"] ?? 0) * 3 * input.skillLevel +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        (input.monster.size === "small"
          ? 1.5
          : input.monster.size === "medium"
            ? 1.3
            : 1.2)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  HN_NAPALM_VULCAN_STRIKE: (input) => ({
    formulaId: "static:HN_NAPALM_VULCAN_STRIKE",
    // C++: skillratio += -100 + 350 + 650 * skill_lv + pc_checkskill(sd, HN_SELFSTUDY_SOCERY) * 4 * skill_lv + 3 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((350 +
        650 * input.skillLevel +
        (input.character.learnedSkills?.["HN_SELFSTUDY_SOCERY"] ?? 0) * 4 * input.skillLevel +
        3 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class TaekwonKidSkillFormula implements SkillFormulaAdapter {
  readonly id = "taekwon-kid";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
