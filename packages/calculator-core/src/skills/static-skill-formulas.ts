import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "./skill-formula.types";

const staticSkillFormulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  SM_BASH: (input) => ({
    formulaId: "static:SM_BASH",
    multiplier: (100 + input.skillLevel * 30) / 100,
    hitCount: 1,
  }),
  MG_COLDBOLT: calculateBoltSkill("MG_COLDBOLT"),
  MG_FIREBOLT: calculateBoltSkill("MG_FIREBOLT"),
  MG_LIGHTNINGBOLT: calculateBoltSkill("MG_LIGHTNINGBOLT"),
};

function calculateBoltSkill(skillId: string) {
  return (input: SkillFormulaInput): SkillFormulaResult => ({
    formulaId: `static:${skillId}`,
    multiplier: 1,
    hitCount: input.skillLevel,
  });
}

export class StaticSkillFormula implements SkillFormulaAdapter {
  readonly id = "static-skill";

  supports(skill: { id: string }) {
    return skill.id in staticSkillFormulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return staticSkillFormulas[input.skill.id](input);
  }
}
