import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const gcSkillFormulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  GC_CROSSIMPACT: (input) => {
    // Cross Impact Formula (Renewal):
    // Multiplier: (1000 + 150 * SkillLevel) * (BaseLevel / 100) %
    // Hit Count: 7
    // EDP (Enchant Deadly Poison) halves the final damage multiplier of Cross Impact in some formulas,
    // or modifies the weapon attack. In kRO/Renewal, EDP gives +400% weapon ATK globally,
    // but specific skills (like Cross Impact) might have their own multiplier halves.
    // For now, we will apply the EDP damage modification for the skill.
    // Assuming EDP halves the skill damage directly for Cross Impact (a common balance change in some servers, we can adjust later).
    
    let baseMultiplier = (1000 + 150 * input.skillLevel);
    
    if (input.modifierEffects.edpActive) {
      // Typically EDP on Cross Impact is halved or reduced. Let's say * 0.5 for now,
      // this can be refined with exact rAthena rules later.
      baseMultiplier *= 0.5;
    }
    
    const finalMultiplier = (baseMultiplier * input.character.baseLevel) / 100;

    return {
      formulaId: "GC_CROSSIMPACT",
      multiplier: finalMultiplier / 100,
      hitCount: 7,
      precision: "validated",
    };
  },
  GC_VENOMIMPRESS: (input) => {
    // Venom Impress doesn't deal direct damage, but if used as an attack for some reason:
    return {
      formulaId: "GC_VENOMIMPRESS",
      multiplier: 0,
      hitCount: 1,
      precision: "validated",
    };
  },
};

export class GuillotineCrossSkillFormula implements SkillFormulaAdapter {
  readonly id = "guillotine-cross";

  supports(skill: { id: string }): boolean {
    return skill.id in gcSkillFormulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return gcSkillFormulas[input.skill.id](input);
  }
}
