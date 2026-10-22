import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  HT_PHANTASMIC: (input) => ({
    formulaId: "static:HT_PHANTASMIC",
    // C++: base_skillratio += 400; (Renewal formula)
    multiplier: 500 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  HT_LANDMINE: (input) => {
    // C++ Renewal battle.cpp: skill_lv * dex * (3 + baseLevel / 100) * (1 + int / 35) + RA_RESEARCHTRAP * 40
    const researchLv = input.character.learnedSkills?.["RA_RESEARCHTRAP"] ?? 0;
    const trapDmg = Math.floor(
      input.skillLevel *
        input.character.effectiveStats.dex *
        (3 + input.character.baseLevel / 100) *
        (1 + input.character.effectiveStats.int / 35),
    ) + researchLv * 40;
    return {
      formulaId: "static:HT_LANDMINE",
      multiplier: 0,
      bonusFlatDamage: trapDmg,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  HT_BLASTMINE: (input) => {
    const researchLv = input.character.learnedSkills?.["RA_RESEARCHTRAP"] ?? 0;
    const trapDmg = Math.floor(
      input.skillLevel *
        input.character.effectiveStats.dex *
        (3 + input.character.baseLevel / 100) *
        (1 + input.character.effectiveStats.int / 35),
    ) + researchLv * 40;
    return {
      formulaId: "static:HT_BLASTMINE",
      multiplier: 0,
      bonusFlatDamage: trapDmg,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  HT_CLAYMORETRAP: (input) => {
    const researchLv = input.character.learnedSkills?.["RA_RESEARCHTRAP"] ?? 0;
    const trapDmg = Math.floor(
      input.skillLevel *
        input.character.effectiveStats.dex *
        (3 + input.character.baseLevel / 100) *
        (1 + input.character.effectiveStats.int / 35),
    ) + researchLv * 40;
    return {
      formulaId: "static:HT_CLAYMORETRAP",
      multiplier: 0,
      bonusFlatDamage: trapDmg,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  HT_FREEZINGTRAP: (input) => ({
    formulaId: "static:HT_FREEZINGTRAP",
    // C++: 100% weapon attack trap
    multiplier: 1.0,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  HT_BLITZBEAT: (input) => {
    // C++ Renewal battle.cpp: md.damage = skill_lv * 20 + HT_STEELCROW * 6 + ((agi / 2) * 2) + ((dex / 10) * 2);
    const steelCrowLv = input.character.learnedSkills?.["HT_STEELCROW"] ?? 0;
    const perHit =
      input.skillLevel * 20 +
      steelCrowLv * 6 +
      Math.floor(input.character.effectiveStats.agi / 2) * 2 +
      Math.floor(input.character.effectiveStats.dex / 10) * 2;
    return {
      formulaId: "static:HT_BLITZBEAT",
      multiplier: 0,
      bonusFlatDamage: perHit * input.skillLevel,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skillLevel,
      precision: "validated",
    };
  },
  HT_POWER: (input) => ({
    formulaId: "static:HT_POWER",
    // C++: base_skillratio += -50 + 8 * sstatus->str;
    multiplier: (50 + 8 * input.character.effectiveStats.str) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  BA_MUSICALSTRIKE: (input) => ({
    formulaId: "static:BA_MUSICALSTRIKE",
    // C++ Renewal: base_skillratio += 10 + 40 * skill_lv; (starts at 100 => 110 + 40 * skill_lv)
    multiplier: (110 + 40 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  DC_THROWARROW: (input) => ({
    formulaId: "static:DC_THROWARROW",
    // C++ Renewal: base_skillratio += 10 + 40 * skill_lv; (starts at 100 => 110 + 40 * skill_lv)
    multiplier: (110 + 40 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
};

export class HunterBardDancerSkillFormula implements SkillFormulaAdapter {
  readonly id = "hunter-bard-dancer";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
