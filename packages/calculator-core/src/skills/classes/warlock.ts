import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const BASE_MULTIPLIERS = {
  COMET: 300,
};

const warlockFormulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  WL_COMET: (input) => {
    // Formula: Base Damage * (BaseLevel / 100)
    // Actually comet usually has a fixed multiplier or scales with level
    let baseDmg = BASE_MULTIPLIERS.COMET * input.skillLevel;
    let multiplier = baseDmg;
    let finalMultiplier = (multiplier * input.character.baseLevel) / 100;

    return {
      formulaId: "WL_COMET",
      multiplier: finalMultiplier / 100,
      hitCount: 1, // Comet hits once? Wait, maybe multi hit visually, but usually 1 hit data
      precision: "validated",
    };
  },
};

export class WarlockSkillFormula implements SkillFormulaAdapter {
  readonly id = "warlock";

  supports(skill: { name: string }): boolean {
    return skill.name in warlockFormulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return warlockFormulas[input.skill.name](input);
  }
}
