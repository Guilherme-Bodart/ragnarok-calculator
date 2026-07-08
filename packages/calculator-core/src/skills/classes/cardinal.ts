import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  CD_PETITIO: (input) => {
    // C++: skillratio += -100 + 1200 * skill_lv + pc_checkskill(sd, CD_MACE_BOOK_M) * 50 * skill_lv + 5 * pow;
    const masteryLv = input.character.learnedSkills?.["CD_MACE_BOOK_M"] || 0;
    const ratio = 1200 * input.skillLevel + (masteryLv * 50 * input.skillLevel) + input.character.effectiveStats.pow * 5;
    return {
      formulaId: "static:CD_PETITIO",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  CD_PNEUMATICUS_PROCELLA: (input) => {
    // C++: skillratio += -100 + 150 + 2100 * skill_lv + 10 * spl + 3 * pc_checkskill( sd, CD_FIDUS_ANIMUS );
    const fidusLv = input.character.learnedSkills?.["CD_FIDUS_ANIMUS"] || 0;
    const ratio = 150 + 2100 * input.skillLevel + input.character.effectiveStats.spl * 10 + 3 * fidusLv;
    return {
      formulaId: "static:CD_PNEUMATICUS_PROCELLA",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  CD_FLAMEN: (input) => {
    // C++ (estimated from others): skillratio += -100 + 400 + 1750 * skill_lv + 10 * spl + 5 * CD_FIDUS_ANIMUS
    const fidusLv = input.character.learnedSkills?.["CD_FIDUS_ANIMUS"] || 0;
    const ratio = 400 + 1750 * input.skillLevel + input.character.effectiveStats.spl * 10 + 5 * fidusLv;
    return {
      formulaId: "static:CD_FLAMEN",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  CD_ARBITRIUM: (input) => {
    // C++: skillratio += -100 + 300 + 1550 * skill_lv + 7 * spl + 3 * CD_FIDUS_ANIMUS
    const fidusLv = input.character.learnedSkills?.["CD_FIDUS_ANIMUS"] || 0;
    const ratio = 300 + 1550 * input.skillLevel + input.character.effectiveStats.spl * 7 + 3 * fidusLv;
    return {
      formulaId: "static:CD_ARBITRIUM",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },

  TR_METALLIC_FURY: (input) => {
    // C++: skillratio += -100 + 3850 * skill_lv + 2 * TR_STAGE_MANNER * spl
    const mannerLv = input.character.learnedSkills?.["TR_STAGE_MANNER"] || 0;
    const ratio = 3850 * input.skillLevel + 2 * mannerLv * input.character.effectiveStats.spl;
    return {
      formulaId: "static:TR_METALLIC_FURY",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  }
};

export class CardinalSkillFormula implements SkillFormulaAdapter {
  readonly id = "cardinal";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
