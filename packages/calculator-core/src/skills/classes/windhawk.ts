import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  WH_GALESTORM: (input) => {
    // C++: skillratio += -100 + 1350 * skill_lv + 10 * sstatus->con;
    const ratio = 1350 * input.skillLevel + input.character.effectiveStats.con * 10;
    return {
      formulaId: "static:WH_GALESTORM",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  WH_CRESCIVE_BOLT: (input) => {
    // C++: skillratio += -100 + 500 + 1300 * skill_lv + 5 * sstatus->con;
    const ratio = 500 + 1300 * input.skillLevel + input.character.effectiveStats.con * 5;
    return {
      formulaId: "static:WH_CRESCIVE_BOLT",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  WH_HAWKRUSH: (input) => {
    // C++: skillratio += -100 + 500 * skill_lv + 5 * con; skillratio += skillratio * WH_NATUREFRIENDLY / 10; RE_LVL_DMOD(100);
    const natureLv = input.character.learnedSkills?.["WH_NATUREFRIENDLY"] ?? 0;
    const baseRatio = 500 * input.skillLevel + 5 * input.character.effectiveStats.con;
    const ratio = baseRatio + Math.floor((baseRatio * natureLv) / 10);
    return {
      formulaId: "static:WH_HAWKRUSH",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  WH_HAWKBOOMERANG: (input) => {
    // C++: skillratio += -100 + 600 * skill_lv + 10 * con; (+ WH_NATUREFRIENDLY / 10, +50% vs brute/fish); RE_LVL_DMOD(100);
    const natureLv = input.character.learnedSkills?.["WH_NATUREFRIENDLY"] ?? 0;
    const baseRatio = 600 * input.skillLevel + 10 * input.character.effectiveStats.con;
    let ratio = baseRatio + Math.floor((baseRatio * natureLv) / 10);
    if (input.monster.race === "brute" || input.monster.race === "fish") {
      ratio += Math.floor((ratio * 50) / 100);
    }
    return {
      formulaId: "static:WH_HAWKBOOMERANG",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  WH_DEEPBLINDTRAP: (input) => {
    // C++: skillratio += -100 + 850 * skill_lv + 5 * con; RE_LVL_DMOD(100); skillratio += skillratio * (20 * WH_ADVANCED_TRAP) / 100;
    const advTrapLv = input.character.learnedSkills?.["WH_ADVANCED_TRAP"] ?? 5;
    const baseRatio = Math.floor(((850 * input.skillLevel + 5 * input.character.effectiveStats.con) * input.character.baseLevel) / 100);
    const ratio = baseRatio + Math.floor((baseRatio * (20 * advTrapLv)) / 100);
    return {
      formulaId: "static:WH_DEEPBLINDTRAP",
      multiplier: ratio / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  WH_SOLIDTRAP: (input) => {
    const advTrapLv = input.character.learnedSkills?.["WH_ADVANCED_TRAP"] ?? 5;
    const baseRatio = Math.floor(((850 * input.skillLevel + 5 * input.character.effectiveStats.con) * input.character.baseLevel) / 100);
    const ratio = baseRatio + Math.floor((baseRatio * (20 * advTrapLv)) / 100);
    return {
      formulaId: "static:WH_SOLIDTRAP",
      multiplier: ratio / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  WH_SWIFTTRAP: (input) => {
    const advTrapLv = input.character.learnedSkills?.["WH_ADVANCED_TRAP"] ?? 5;
    const baseRatio = Math.floor(((850 * input.skillLevel + 5 * input.character.effectiveStats.con) * input.character.baseLevel) / 100);
    const ratio = baseRatio + Math.floor((baseRatio * (20 * advTrapLv)) / 100);
    return {
      formulaId: "static:WH_SWIFTTRAP",
      multiplier: ratio / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  WH_FLAMETRAP: (input) => {
    const advTrapLv = input.character.learnedSkills?.["WH_ADVANCED_TRAP"] ?? 5;
    const baseRatio = Math.floor(((850 * input.skillLevel + 5 * input.character.effectiveStats.con) * input.character.baseLevel) / 100);
    const ratio = baseRatio + Math.floor((baseRatio * (20 * advTrapLv)) / 100);
    return {
      formulaId: "static:WH_FLAMETRAP",
      multiplier: ratio / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  WH_WILD_WALK: (input) => {
    // C++: skillratio += -100 + 1800 + 2800 * skill_lv + 5 * con; (+ WH_NATUREFRIENDLY / 10, + HT_STEELCROW / 10); RE_LVL_DMOD(100);
    const natureLv = input.character.learnedSkills?.["WH_NATUREFRIENDLY"] ?? 0;
    const steelCrowLv = input.character.learnedSkills?.["HT_STEELCROW"] ?? 0;
    let ratio = 1800 + 2800 * input.skillLevel + 5 * input.character.effectiveStats.con;
    ratio += Math.floor((ratio * natureLv) / 10);
    ratio += Math.floor((ratio * steelCrowLv) / 10);
    return {
      formulaId: "static:WH_WILD_WALK",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
};

export class WindhawkSkillFormula implements SkillFormulaAdapter {
  readonly id = "windhawk";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
