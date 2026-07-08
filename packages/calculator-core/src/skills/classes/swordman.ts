import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

function calculateBoltSkill(skillId: string) {
  return (input: SkillFormulaInput): SkillFormulaResult => ({
    formulaId: `static:${skillId}`,
    multiplier: 1,
    hitCount: input.skillLevel,
    precision: "validated",
  });
}

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  SM_BASH: (input) => ({
    formulaId: "static:SM_BASH",
    multiplier: (100 + input.skillLevel * 30) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SM_MAGNUM: (input) => ({
    formulaId: "static:SM_MAGNUM",
    multiplier: (100 + input.skillLevel * 20) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MG_COLDBOLT: calculateBoltSkill("MG_COLDBOLT"),
  MG_FIREBOLT: calculateBoltSkill("MG_FIREBOLT"),
  MG_LIGHTNINGBOLT: calculateBoltSkill("MG_LIGHTNINGBOLT"),
  MG_SOULSTRIKE: (input) => {
    const isUndead = input.monster.race === "undead" || input.monster.element === "undead";
    const bonusHit = isUndead ? 1 : 0;
    const baseHits = input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skillLevel;
    
    return {
      formulaId: "static:MG_SOULSTRIKE",
      multiplier: 1.0, // 100% MATK per hit
      hitCount: baseHits + bonusHit,
      precision: "validated",
    };
  }
};

export class SwordmanSkillFormula implements SkillFormulaAdapter {
  readonly id = "swordman";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
