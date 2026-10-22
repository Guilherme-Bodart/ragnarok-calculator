import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  SU_SCRATCH: (input) => ({
    formulaId: "static:SU_SCRATCH",
    // C++: base_skillratio += -50 + 50 * skill_lv;
    multiplier: (50 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SU_SCAROFTAROU: (input) => ({
    formulaId: "static:SU_SCAROFTAROU",
    // C++: base_skillratio += -100 + 100 * skill_lv; + SpiritOfLife (x2 at Max HP)
    multiplier: (100 * input.skillLevel * 2) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SU_PICKYPECK: (input) => ({
    formulaId: "static:SU_PICKYPECK",
    // C++: base_skillratio += 100 + 100 * skill_lv; + SpiritOfLife (x2 at Max HP)
    // * Note: deals double damage if target HP < 50%, ignored for baseline.
    multiplier: ((200 + 100 * input.skillLevel) * 2) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SU_SVG_SPIRIT: (input) => ({
    formulaId: "static:SU_SVG_SPIRIT", // Spirit of Savage
    // C++: base_skillratio += 150 + 150 * skill_lv; + SpiritOfLife (x2 at Max HP)
    multiplier: ((250 + 150 * input.skillLevel) * 2) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SU_LUNATICCARROTBEAT: (input) => ({
    formulaId: "static:SU_LUNATICCARROTBEAT",
    // C++: skillratio += 100 + 100 * skill_lv; + SpiritOfLife (x2) + STR; RE_LVL_DMOD(100)
    multiplier: (((200 + 100 * input.skillLevel) * 2 + input.character.effectiveStats.str) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SU_SV_STEMSPEAR: (input) => ({
    formulaId: "static:SU_SV_STEMSPEAR", // Silvervine Stem Spear
    // C++: base_skillratio += 600; (so 700% base)
    // Note: Magic damage usually scales with base level dynamically. Assuming standard.
    multiplier: (700 * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SU_CN_METEOR: (input) => ({
    formulaId: "static:SU_CN_METEOR", // Catnip Meteor
    // C++: skillratio += -100 + 200 + 100 * skill_lv; + INT*5; RE_LVL_DMOD(100)
    multiplier: ((200 + 100 * input.skillLevel + input.character.effectiveStats.int * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SU_BITE: (input) => ({
    formulaId: "static:SU_BITE",
    // C++: base_skillratio += 100;
    multiplier: 200 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SH_CHUL_HO_SONIC_CLAW: (input) => ({
    formulaId: "static:SH_CHUL_HO_SONIC_CLAW",
    // C++: skillratio += -100 + 1100 + 2200 * skill_lv + 50 * pc_checkskill(sd, SH_MYSTICAL_CREATURE_MASTERY) + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((1100 +
        2200 * input.skillLevel +
        50 * (input.character.learnedSkills?.["SH_MYSTICAL_CREATURE_MASTERY"] ?? 0) +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SH_HYUN_ROKS_BREEZE: (input) => ({
    formulaId: "static:SH_HYUN_ROKS_BREEZE",
    // C++: skillratio += -100 + 650 + 750 * skill_lv + 20 * pc_checkskill(sd, SH_MYSTICAL_CREATURE_MASTERY) + 5 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((650 +
        750 * input.skillLevel +
        20 * (input.character.learnedSkills?.["SH_MYSTICAL_CREATURE_MASTERY"] ?? 0) +
        5 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SH_HYUN_ROK_CANNON: (input) => ({
    formulaId: "static:SH_HYUN_ROK_CANNON",
    // C++: skillratio += -100 + 1100 + 2050 * skill_lv + 50 * pc_checkskill(sd, SH_MYSTICAL_CREATURE_MASTERY) + 5 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((1100 +
        2050 * input.skillLevel +
        50 * (input.character.learnedSkills?.["SH_MYSTICAL_CREATURE_MASTERY"] ?? 0) +
        5 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SH_CHUL_HO_BATTERING: (input) => ({
    formulaId: "static:SH_CHUL_HO_BATTERING",
    // C++: skillratio += -100 + 480 + 160 * skill_lv + 70 * pc_checkskill(sd, SH_MYSTICAL_CREATURE_MASTERY) + 5 * sstatus->pow; RE_LVL_DMOD(100);
    multiplier:
      ((480 +
        160 * input.skillLevel +
        70 * (input.character.learnedSkills?.["SH_MYSTICAL_CREATURE_MASTERY"] ?? 0) +
        5 * (input.character.effectiveStats.pow ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SH_HYUN_ROK_SPIRIT_POWER: (input) => ({
    formulaId: "static:SH_HYUN_ROK_SPIRIT_POWER",
    // C++: skillratio += -100 + 350 + 200 * skill_lv + 30 * pc_checkskill(sd, SH_MYSTICAL_CREATURE_MASTERY) + 5 * sstatus->spl; RE_LVL_DMOD(100);
    multiplier:
      ((350 +
        200 * input.skillLevel +
        30 * (input.character.learnedSkills?.["SH_MYSTICAL_CREATURE_MASTERY"] ?? 0) +
        5 * (input.character.effectiveStats.spl ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
};

export class SummonerSkillFormula implements SkillFormulaAdapter {
  readonly id = "summoner";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
