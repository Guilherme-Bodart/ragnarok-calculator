import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  SL_SMA: (input) => ({
    formulaId: "static:SL_SMA", // Esma
    // C++: base_skillratio += -60 + status_get_lv(src);
    multiplier: (40 + input.character.baseLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SL_STIN: (input) => ({
    formulaId: "static:SL_STIN", // Estin
    // C++: base_skillratio += (tstatus->size == SZ_SMALL ? 10 * skill_lv : -99);
    multiplier: (input.monster.size === "small" ? 100 + 10 * input.skillLevel : 1) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SL_STUN: (input) => ({
    formulaId: "static:SL_STUN", // Estun
    // C++: base_skillratio += 5 * skill_lv;
    multiplier: (100 + 5 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class SoulLinkerSkillFormula implements SkillFormulaAdapter {
  readonly id = "soul-linker";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
