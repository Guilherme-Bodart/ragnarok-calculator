import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  SN_SHARPSHOOTING: (input) => ({
    formulaId: "static:SN_SHARPSHOOTING",
    // C++: skillratio += -100 + 300 + 300 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((300 + 300 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SN_FALCONASSAULT: (input) => {
    // C++ Renewal battle.cpp: Blitz Beat (Lv5 = 5 hits) * (150 + 70 * skill_lv) / 100
    const steelCrowLv = input.character.learnedSkills?.["HT_STEELCROW"] ?? 0;
    const blitzPerHit =
      5 * 20 +
      steelCrowLv * 6 +
      Math.floor(input.character.effectiveStats.agi / 2) * 2 +
      Math.floor(input.character.effectiveStats.dex / 10) * 2;
    const totalDmg = Math.floor((blitzPerHit * 5 * (150 + 70 * input.skillLevel)) / 100);
    return {
      formulaId: "static:SN_FALCONASSAULT",
      multiplier: 0,
      bonusFlatDamage: totalDmg,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  CG_ARROWVULCAN: (input) => ({
    formulaId: "static:CG_ARROWVULCAN",
    // C++ Renewal: skillratio += 400 + 100 * skill_lv; (starts at 100 => 500 + 100 * skill_lv); RE_LVL_DMOD(100);
    multiplier: ((500 + 100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
};

export class SniperClownGypsySkillFormula implements SkillFormulaAdapter {
  readonly id = "sniper-clown-gypsy";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
