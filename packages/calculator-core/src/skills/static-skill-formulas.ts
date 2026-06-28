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
    precision: "validated",
  }),
  SM_MAGNUM: (input) => ({
    formulaId: "static:SM_MAGNUM",
    multiplier: (100 + input.skillLevel * 20) / 100,
    hitCount: 1,
    precision: "validated",
  }),
  KN_BOWLINGBASH: (input) => ({
    formulaId: "static:KN_BOWLINGBASH",
    multiplier: (100 + input.skillLevel * 40) / 100,
    hitCount: 2,
    precision: "validated",
  }),
  KN_PIERCE: (input) => {
    const hitsBySize = { small: 1, medium: 2, large: 3 } as const;
    return {
      formulaId: "static:KN_PIERCE",
      multiplier: (100 + input.skillLevel * 10) / 100,
      hitCount: hitsBySize[input.monster.size],
      precision: "validated",
    };
  },
  LK_SPIRALPIERCE: (input) => ({
    formulaId: "static:LK_SPIRALPIERCE",
    multiplier: (100 + input.skillLevel * 50) / 100,
    hitCount: 5,
    precision: "validated",
  }),
  MG_COLDBOLT: calculateBoltSkill("MG_COLDBOLT"),
  MG_FIREBOLT: calculateBoltSkill("MG_FIREBOLT"),
  MG_LIGHTNINGBOLT: calculateBoltSkill("MG_LIGHTNINGBOLT"),
  MG_SOULSTRIKE: (input) => {
    const isUndead = input.monster.race === "undead" || input.monster.element === "undead";
    const bonusHit = isUndead ? 1 : 0;
    // Base hits costumam vir do hitCountByLevel, ou usamos a regra padrão: (lv/2) arredondado para cima?
    // O hitCountByLevel no rAthena já tem o hitCount correto por nível. Usaremos ele + bonusHit.
    const baseHits = input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skillLevel;
    
    return {
      formulaId: "static:MG_SOULSTRIKE",
      multiplier: 1.0, // 100% MATK per hit
      hitCount: baseHits + bonusHit,
      precision: "validated",
    };
  },
  AG_SOUL_VC_STRIKE: (input) => ({
    formulaId: "static:AG_SOUL_VC_STRIKE",
    // LATAM Renewal: 180% por nível. SPL*3 não é multiplicado por level.
    // Fórmula: ((180 * level) + (SPL * 3)) * (BaseLevel / 100)
    multiplier:
      ((180 * input.skillLevel + input.character.effectiveStats.spl * 3) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount:
      input.skill.hitCountByLevel?.[String(input.skillLevel)] ??
      input.skill.hitCount,
    precision: "validated",
  }),
};

function calculateBoltSkill(skillId: string) {
  return (input: SkillFormulaInput): SkillFormulaResult => ({
    formulaId: `static:${skillId}`,
    multiplier: 1,
    hitCount: input.skillLevel,
    precision: "validated",
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
