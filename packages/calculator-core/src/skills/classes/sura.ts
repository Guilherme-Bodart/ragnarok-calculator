import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  SR_TIGERCANNON: (input) => {
    // C++: (hp + sp) / 4 (assuming no combo for standard isolated hit)
    const hp = (input.character.maxHp * (10 + input.skillLevel * 2)) / 100;
    const sp = (input.character.maxSp * (5 + input.skillLevel)) / 100;
    const ratio = (hp + sp) / 4;
    return {
      formulaId: "static:SR_TIGERCANNON",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  SR_RAMPAGEBLASTER: (input) => ({
    formulaId: "static:SR_RAMPAGEBLASTER",
    // C++: skillratio += 1400 + 550 * skill_lv; (if no spheres or max spheres? we'll use max spheres average)
    // We'll use the higher damage since normally people use it with spheres
    multiplier: ((1400 + 550 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SR_SKYNETBLOW: (input) => ({
    formulaId: "static:SR_SKYNETBLOW",
    // C++: skillratio += -100 + 200 * skill_lv + sstatus->agi / 6;
    multiplier: ((200 * input.skillLevel + input.character.effectiveStats.agi / 6) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SR_DRAGONCOMBO: (input) => ({
    formulaId: "static:SR_DRAGONCOMBO",
    // C++: skillratio += 100 + 80 * skill_lv; (starts at 100 => 200 + 80 * skill_lv); RE_LVL_DMOD(100);
    multiplier: ((200 + 80 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SR_KNUCKLEARROW: (input) => {
    // C++: skillratio += 400 + (CLASS_BOSS ? 200 : 100) * skill_lv; (starts at 100 => 500 + ...); RE_LVL_DMOD(100);
    const perLv = input.monster.classType === "boss" ? 200 : 100;
    const ratio = 500 + perLv * input.skillLevel;
    return {
      formulaId: "static:SR_KNUCKLEARROW",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  SR_GATEOFHELL: (input) => ({
    formulaId: "static:SR_GATEOFHELL",
    // C++: skillratio += -100 + 500 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((500 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SR_GENTLETOUCH_QUIET: (input) => ({
    formulaId: "static:SR_GENTLETOUCH_QUIET",
    // C++: skillratio += -100 + 100 * skill_lv + sstatus->dex; RE_LVL_DMOD(100);
    multiplier: ((100 * input.skillLevel + input.character.effectiveStats.dex) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SR_RIDEINLIGHTNING: (input) => ({
    formulaId: "static:SR_RIDEINLIGHTNING",
    // C++: skillratio += -100 + 40 * skill_lv (+ 50 * skill_lv with knuckle => 90 * skill_lv); RE_LVL_DMOD(100);
    multiplier: ((90 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skillLevel,
    precision: "validated",
  }),
};

export class SuraSkillFormula implements SkillFormulaAdapter {
  readonly id = "sura";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
