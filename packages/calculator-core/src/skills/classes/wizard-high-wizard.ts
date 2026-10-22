import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  WZ_STORMGUST: (input) => ({
    formulaId: "static:WZ_STORMGUST",
    // C++: base_skillratio -= 30; base_skillratio += 50 * skill_lv; (70 + 50 * skillLevel)
    multiplier: (70 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WZ_VERMILION: (input) => ({
    formulaId: "static:WZ_VERMILION",
    // C++: base_skillratio += 300 + skill_lv * 100;
    multiplier: (400 + 100 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WZ_METEOR: (input) => ({
    formulaId: "static:WZ_METEOR",
    // C++: base_skillratio += 25;
    multiplier: 125 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WZ_WATERBALL: (input) => ({
    formulaId: "static:WZ_WATERBALL",
    // C++: base_skillratio += 30 * skill_lv;
    multiplier: (100 + 30 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WZ_EARTHSPIKE: (input) => ({
    formulaId: "static:WZ_EARTHSPIKE",
    // C++: base_skillratio += 100;
    multiplier: 200 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WZ_HEAVENDRIVE: (input) => ({
    formulaId: "static:WZ_HEAVENDRIVE",
    // C++: base_skillratio += 25;
    multiplier: 125 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WZ_FIREPILLAR: (input) => ({
    formulaId: "static:WZ_FIREPILLAR",
    // C++: base_skillratio += -60 + 20 * skill_lv;
    multiplier: (40 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WZ_FROSTNOVA: (input) => ({
    formulaId: "static:WZ_FROSTNOVA",
    // C++: base_skillratio += 10 * skill_lv;
    multiplier: (100 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WZ_JUPITEL: (input) => ({
    formulaId: "static:WZ_JUPITEL",
    // C++: 100% MATK per hit, hits = 2 + skill_lv
    multiplier: 1.0,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? (2 + input.skillLevel),
    precision: "validated",
  }),
  HW_MAGICCRASHER: (input) => ({
    formulaId: "static:HW_MAGICCRASHER",
    // C++: 100% MATK
    multiplier: 1.0,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  HW_NAPALMVULCAN: (input) => ({
    formulaId: "static:HW_NAPALMVULCAN",
    // C++ Renewal: skillratio += -100 + 70 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((70 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skillLevel,
    precision: "validated",
  }),
  HW_GRAVITATION: (input) => ({
    formulaId: "static:HW_GRAVITATION",
    // C++ Renewal: skillratio += -100 + 100 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  PF_SOULBURN: (input) => ({
    formulaId: "static:PF_SOULBURN",
    // C++: 100% MATK on Lv 5 + SP burn
    multiplier: 1.0,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
};

export class WizardHighWizardSkillFormula implements SkillFormulaAdapter {
  readonly id = "wizard-high-wizard";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
