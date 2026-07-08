import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  MG_NAPALMBEAT: (input) => ({
    formulaId: "static:MG_NAPALMBEAT",
    // C++: base_skillratio += -30 + 10 * skill_lv;
    multiplier: (70 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MG_FIREBALL: (input) => ({
    formulaId: "static:MG_FIREBALL",
    // C++: base_skillratio += 40 + 20 * skill_lv;
    multiplier: (140 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MG_FROSTDIVER: (input) => ({
    formulaId: "static:MG_FROSTDIVER",
    // C++: base_skillratio += 10 * skill_lv;
    multiplier: (100 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MG_FIREWALL: (input) => ({
    formulaId: "static:MG_FIREWALL",
    // firewall damage in rathena is 50%
    multiplier: 50 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class MageSkillFormula implements SkillFormulaAdapter {
  readonly id = "mage";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
