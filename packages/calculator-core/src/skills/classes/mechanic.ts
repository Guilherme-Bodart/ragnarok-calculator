import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  NC_POWERSWING: (input) => ({
    formulaId: "static:NC_POWERSWING",
    // C++: skillratio += -100 + ((sstatus->str + sstatus->dex)/ 2) + 300 + 100 * skill_lv;
    multiplier: ((300 + 100 * input.skillLevel + Math.floor((input.character.effectiveStats.str + input.character.effectiveStats.dex) / 2)) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NC_AXEBOOMERANG: (input) => ({
    formulaId: "static:NC_AXEBOOMERANG",
    // C++: skillratio += 150 + 50 * skill_lv; (ignores weapon weight in this basic implementation)
    multiplier: ((150 + 50 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NC_VULCANARM: (input) => ({
    formulaId: "static:NC_VULCANARM",
    // C++: skillratio += -100 + 230 * skill_lv + sstatus->dex;
    multiplier: ((230 * input.skillLevel + input.character.effectiveStats.dex) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NC_ARMSCANNON: (input) => ({
    formulaId: "static:NC_ARMSCANNON",
    // C++: skillratio += -100 + 400 + 350 * skill_lv;
    multiplier: ((400 + 350 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class MechanicSkillFormula implements SkillFormulaAdapter {
  readonly id = "mechanic";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
