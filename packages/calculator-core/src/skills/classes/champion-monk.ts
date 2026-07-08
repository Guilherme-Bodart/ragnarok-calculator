import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  CH_PALMSTRIKE: (input) => ({
    formulaId: "static:CH_PALMSTRIKE",
    // C++: skillratio += 100 + 100 * skill_lv + sstatus->str; RE_LVL_DMOD(100);
    multiplier: ((200 + 100 * input.skillLevel + input.character.effectiveStats.str) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  CH_TIGERFIST: (input) => ({
    formulaId: "static:CH_TIGERFIST",
    // C++: skillratio += 400 + 150 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((500 + 150 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  CH_CHAINCRUSH: (input) => ({
    formulaId: "static:CH_CHAINCRUSH",
    // C++: skillratio += -100 + 200 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((200 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MO_FINGEROFFENSIVE: (input) => ({
    formulaId: "static:MO_FINGEROFFENSIVE",
    // C++: base_skillratio += 500 + skill_lv * 200;
    multiplier: (600 + 200 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MO_TRIPLEATTACK: (input) => ({
    formulaId: "static:MO_TRIPLEATTACK",
    // C++: base_skillratio += 20 * skill_lv;
    multiplier: (120 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MO_CHAINCOMBO: (input) => ({
    formulaId: "static:MO_CHAINCOMBO",
    // C++: base_skillratio += 150 + 50 * skill_lv;
    multiplier: (250 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MO_COMBOFINISH: (input) => ({
    formulaId: "static:MO_COMBOFINISH",
    // C++: base_skillratio += 450 + 50 * skill_lv + sstatus->str;
    multiplier: (550 + 50 * input.skillLevel + input.character.effectiveStats.str) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MO_INVESTIGATE: (input) => ({
    formulaId: "static:MO_INVESTIGATE",
    // C++: base_skillratio += -100 + 100 * skill_lv; (Def portion handled in ATK logic)
    multiplier: (100 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class ChampionMonkSkillFormula implements SkillFormulaAdapter {
  readonly id = "champion-monk";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
