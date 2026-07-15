import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  AG_SOUL_VC_STRIKE: (input) => {
    const hitCount = input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount;
    // Formula per hit: (180 * skillLevel + 3 * SPL) * BaseLv / 100
    const perHitRatio = (180 * input.skillLevel) + (input.character.effectiveStats.spl * 3);
    const multiplier = (perHitRatio * input.character.baseLevel / 100 / 100) * hitCount;
    return {
      formulaId: "static:AG_SOUL_VC_STRIKE",
      multiplier,
      hitCount,
      precision: "validated",
    };
  },
  AG_CRIMSON_ARROW: (input) => ({
    formulaId: "static:AG_CRIMSON_ARROW",
    // C++: skillratio += -100 + 400 * skill_lv + 3 * spl
    multiplier: ((400 * input.skillLevel + input.character.effectiveStats.spl * 3) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_ALL_BLOOM: (input) => ({
    formulaId: "static:AG_ALL_BLOOM",
    // C++ (AG_ALL_BLOOM_ATK): skillratio += -100 + 200 + 1200 * skill_lv + 5 * spl
    multiplier: ((200 + 1200 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_ASTRAL_STRIKE: (input) => {
    // C++: skillratio += -100 + 300 + 1800 * skill_lv + 10 * spl
    // If undead/dragon: + 100 + 300 * skill_lv
    const isBonusRace = input.monster.race === "undead" || input.monster.race === "dragon";
    let ratio = 300 + 1800 * input.skillLevel + input.character.effectiveStats.spl * 10;
    if (isBonusRace) ratio += 100 + 300 * input.skillLevel;
    
    return {
      formulaId: "static:AG_ASTRAL_STRIKE",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  AG_ROCK_DOWN: (input) => ({
    formulaId: "static:AG_ROCK_DOWN",
    // C++: skillratio += -100 + 1550 * skill_lv + 5 * spl 
    // (+300 * skill_lv if climax, we will assume no climax or add climax buff later)
    multiplier: ((1550 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_STORM_CANNON: (input) => ({
    formulaId: "static:AG_STORM_CANNON",
    // C++: skillratio += -100 + 1550 * skill_lv + 5 * spl
    multiplier: ((1550 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_RAIN_OF_CRYSTAL: (input) => ({
    formulaId: "static:AG_RAIN_OF_CRYSTAL",
    // C++: skillratio += -100 + 180 + 760 * skill_lv + 5 * spl
    multiplier: ((180 + 760 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_STRANTUM_TREMOR: (input) => ({
    formulaId: "static:AG_STRANTUM_TREMOR",
    // C++: skillratio += -100 + 100 + 730 * skill_lv + 5 * spl
    multiplier: ((100 + 730 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_TORNADO_STORM: (input) => ({
    formulaId: "static:AG_TORNADO_STORM",
    // C++: skillratio += -100 + 100 + 760 * skill_lv + 5 * spl
    multiplier: ((100 + 760 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_VIOLENT_QUAKE: (input) => ({
    formulaId: "static:AG_VIOLENT_QUAKE",
    // C++: skillratio += -100 + 200 + 1200 * skill_lv + 5 * spl
    multiplier: ((200 + 1200 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_MYSTERY_ILLUSION: (input) => ({
    formulaId: "static:AG_MYSTERY_ILLUSION",
    // C++: skillratio += -100 + 500 * skill_lv + 5 * spl
    multiplier: ((500 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class ArchMageSkillFormula implements SkillFormulaAdapter {
  readonly id = "arch-mage";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
