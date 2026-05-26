import { DamageFormulaPipeline, type DamageBreakdownLine } from "./damage-formula-pipeline";
import type { CalculatorModifierEffects } from "./calculator-modifier-effects";
import type { EffectiveCharacter } from "./effective-character";
import type { RoItem, RoMonster, RoSkill } from "./ro-types";

export type DamageEngineInput = {
  character: EffectiveCharacter;
  items: RoItem[];
  modifierEffects: CalculatorModifierEffects;
  monster: RoMonster;
  skill: RoSkill;
  skillLevel: number;
};

export class DamageEngine {
  constructor(private readonly formulaPipeline = new DamageFormulaPipeline()) {}

  calculate(input: DamageEngineInput) {
    return this.formulaPipeline.calculate(input);
  }
}

export type { DamageBreakdownLine };
