import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  GN_CARTCANNON: (input) => ({
    formulaId: "static:GN_CARTCANNON",
    // C++: skillratio += -100 + (250 + 20 * remodeling_cart) * skill_lv + 2 * sstatus->int_ / (6 - remodeling_cart);
    // Assuming max Remodeling Cart (Lv 5) -> 350 * skill_lv + 2 * INT
    multiplier: ((350 * input.skillLevel + 2 * input.character.effectiveStats.int) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GN_SPORE_EXPLOSION: (input) => ({
    formulaId: "static:GN_SPORE_EXPLOSION",
    // C++: skillratio += -100 + 400 + 200 * skill_lv;
    multiplier: ((400 + 200 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GN_CRAZYWEED_ATK: (input) => ({
    formulaId: "static:GN_CRAZYWEED_ATK",
    // C++: skillratio += -100 + 700 + 100 * skill_lv;
    multiplier: ((700 + 100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GN_THORNS_TRAP: (input) => ({
    formulaId: "static:GN_THORNS_TRAP",
    // C++ battle.cpp: md.damage = 100 + 200 * skill_lv + status_get_int(src);
    multiplier: 0,
    bonusFlatDamage: 100 + 200 * input.skillLevel + input.character.effectiveStats.int,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GN_WALLOFTHORN: (input) => ({
    formulaId: "static:GN_WALLOFTHORN",
    // C++: base_skillratio += 10 * skill_lv; (starts at 100 => 100 + 10 * skill_lv)
    multiplier: (100 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GN_DEMONIC_FIRE: (input) => ({
    formulaId: "static:GN_DEMONIC_FIRE",
    // C++: skillratio += 10 + 20 * skill_lv; (starts at 100 => 110 + 20 * skill_lv)
    multiplier: (110 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GN_FIRE_EXPANSION: (input) => {
    // C++: Lv5 casts Acid Demonstration; Lv1-2 boosts Demonic Fire (110 + 20 * skill_lv + int + jobLevel) * baseLevel / 100
    const ratio = 110 + 20 * input.skillLevel + input.character.effectiveStats.int + input.character.jobLevel;
    return {
      formulaId: "static:GN_FIRE_EXPANSION",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  GN_ILLUSIONDOPING: (input) => ({
    formulaId: "static:GN_ILLUSIONDOPING",
    // C++: 100% ATK AoE status & hit
    multiplier: 1.0,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
};

export class GeneticSkillFormula implements SkillFormulaAdapter {
  readonly id = "genetic";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
