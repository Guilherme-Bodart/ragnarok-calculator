import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  AL_RUWACH: (input) => ({
    formulaId: "static:AL_RUWACH",
    // C++: base_skillratio += 45;
    multiplier: 145 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AL_HOLYLIGHT: (input) => ({
    formulaId: "static:AL_HOLYLIGHT",
    // C++: base_skillratio += 25;
    multiplier: 125 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class AcolyteSkillFormula implements SkillFormulaAdapter {
  readonly id = "acolyte";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
