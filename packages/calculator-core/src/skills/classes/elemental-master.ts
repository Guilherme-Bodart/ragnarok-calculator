import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  EM_DIAMOND_STORM: (input) => ({
    formulaId: "static:EM_DIAMOND_STORM",
    multiplier: ((700 + 1100 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  EM_CONFLAGRATION: (input) => ({
    formulaId: "static:EM_CONFLAGRATION",
    multiplier: ((700 + 1100 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  EM_LIGHTNING_LAND: (input) => ({
    formulaId: "static:EM_LIGHTNING_LAND",
    multiplier: ((700 + 1100 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  EM_VENOM_SWAMP: (input) => ({
    formulaId: "static:EM_VENOM_SWAMP",
    multiplier: ((700 + 1100 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  EM_TERRA_DRIVE: (input) => ({
    formulaId: "static:EM_TERRA_DRIVE",
    multiplier: ((500 + 2400 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class ElementalMasterSkillFormula implements SkillFormulaAdapter {
  readonly id = "elemental-master";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
