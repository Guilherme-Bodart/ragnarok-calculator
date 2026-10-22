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
  }),
  NC_BOOSTKNUCKLE: (input) => ({
    formulaId: "static:NC_BOOSTKNUCKLE",
    // C++: skillratio += -100 + 260 * skill_lv + sstatus->dex; RE_LVL_DMOD(100);
    multiplier: ((260 * input.skillLevel + input.character.effectiveStats.dex) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NC_PILEBUNKER: (input) => ({
    formulaId: "static:NC_PILEBUNKER",
    // C++: skillratio += 200 + 100 * skill_lv + status_get_str(src); (starts at 100 => 300 + 100 * skill_lv + str); RE_LVL_DMOD(100);
    multiplier: ((300 + 100 * input.skillLevel + input.character.effectiveStats.str) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NC_FLAMELAUNCHER: (input) => ({
    formulaId: "static:NC_FLAMELAUNCHER",
    // C++: skillratio += 200 + 300 * skill_lv; (starts at 100 => 300 + 300 * skill_lv); RE_LVL_DMOD(150);
    multiplier: ((300 + 300 * input.skillLevel) * input.character.baseLevel) / 150 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NC_COLDSLOWER: (input) => ({
    formulaId: "static:NC_COLDSLOWER",
    // C++: skillratio += 200 + 300 * skill_lv; (starts at 100 => 300 + 300 * skill_lv); RE_LVL_DMOD(150);
    multiplier: ((300 + 300 * input.skillLevel) * input.character.baseLevel) / 150 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NC_MAGMA_ERUPTION: (input) => ({
    formulaId: "static:NC_MAGMA_ERUPTION",
    // C++: base_skillratio += 350 + 50 * skill_lv; (starts at 100 => 450 + 50 * skill_lv)
    multiplier: (450 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
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
