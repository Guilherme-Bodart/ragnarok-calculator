import type { EffectiveCharacter } from "../effective-character";
import type { RoMonster, RoSkill } from "../ro-types";

import type { CalculatorModifierEffects } from "../calculator-modifier-effects";

export type SkillFormulaInput = {
  character: EffectiveCharacter;
  modifierEffects: CalculatorModifierEffects;
  monster: RoMonster;
  skill: RoSkill;
  skillLevel: number;
};

export type SkillFormulaResult = {
  formulaId: string;
  multiplier: number;
  bonusFlatDamage?: number;
  hitCount: number;
  precision: "validated" | "inferred" | "partial" | "prototype";
};

export type SkillFormulaAdapter = {
  id: string;
  supports(skill: RoSkill): boolean;
  calculate(input: SkillFormulaInput): SkillFormulaResult;
};
