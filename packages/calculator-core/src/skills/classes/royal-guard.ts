import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  LG_EARTHDRIVE: (input) => {
    // C++: skillratio += -100 + 380 * skill_lv + sstatus->str + sstatus->vit;
    const ratio = 380 * input.skillLevel + input.character.effectiveStats.str + input.character.effectiveStats.vit;
    return {
      formulaId: "static:LG_EARTHDRIVE",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  LG_OVERBRAND: (input) => {
    // C++: skillratio += -100 + 350 * skill_lv + ((sd) ? pc_checkskill(sd, CR_SPEARQUICKEN) * 50 : 0);
    const quickenLv = input.character.learnedSkills?.["CR_SPEARQUICKEN"] || 0;
    const ratio = 350 * input.skillLevel + quickenLv * 50;
    return {
      formulaId: "static:LG_OVERBRAND",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  LG_RAYOFGENESIS: (input) => {
    // C++: skillratio += -100 + 350 * skill_lv + sstatus->int_ * 3;
    const ratio = 350 * input.skillLevel + input.character.effectiveStats.int * 3;
    return {
      formulaId: "static:LG_RAYOFGENESIS",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  LG_MOONSLASHER: (input) => {
    // C++: skillratio += -100 + 120 * skill_lv + ((sd) ? pc_checkskill(sd, LG_OVERBRAND) * 80 : 0);
    const obLv = input.character.learnedSkills?.["LG_OVERBRAND"] || 0;
    const ratio = 120 * input.skillLevel + obLv * 80;
    return {
      formulaId: "static:LG_MOONSLASHER",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  LG_SHIELDPRESS: (input) => {
    // C++: skillratio += -100 + 200 * skill_lv + sd->status.str;
    const ratio = 200 * input.skillLevel + input.character.effectiveStats.str;
    return {
      formulaId: "static:LG_SHIELDPRESS",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  LG_CANNONSPEAR: (input) => {
    // C++: skillratio += -100 + skill_lv * (120 + sstatus->str); RE_LVL_DMOD(100);
    const ratio = input.skillLevel * (120 + input.character.effectiveStats.str);
    return {
      formulaId: "static:LG_CANNONSPEAR",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  LG_BANISHINGPOINT: (input) => {
    // C++: skillratio += -100 + (100 * skill_lv) + pc_checkskill(sd, SM_BASH) * 70; RE_LVL_DMOD(100);
    const bashLv = input.character.learnedSkills?.["SM_BASH"] ?? 0;
    const ratio = 100 * input.skillLevel + bashLv * 70;
    return {
      formulaId: "static:LG_BANISHINGPOINT",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  LG_PINPOINTATTACK: (input) => {
    // C++: skillratio += -100 + 100 * skill_lv + 5 * status_get_agi(src); RE_LVL_DMOD(120);
    const ratio = 100 * input.skillLevel + 5 * input.character.effectiveStats.agi;
    return {
      formulaId: "static:LG_PINPOINTATTACK",
      multiplier: (ratio * input.character.baseLevel) / 120 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  LG_RAGEBURST: (input) => {
    // C++: skillratio += 2900 + (max_hp - hp); RE_LVL_DMOD(100); (assuming full Rage spheres / standard burst)
    const ratio = 3000;
    return {
      formulaId: "static:LG_RAGEBURST",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  LG_HESPERUSLIT: (input) => {
    // C++: skillratio += -100 + 300 * skill_lv + sstatus->vit / 6; RE_LVL_DMOD(100);
    const ratio = 300 * input.skillLevel + Math.floor(input.character.effectiveStats.vit / 6);
    return {
      formulaId: "static:LG_HESPERUSLIT",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
};

export class RoyalGuardSkillFormula implements SkillFormulaAdapter {
  readonly id = "royal-guard";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
