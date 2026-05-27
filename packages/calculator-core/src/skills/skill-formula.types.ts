import type { EffectiveCharacter } from "../effective-character";
import type { RoMonster, RoSkill } from "../ro-types";

export type SkillFormulaInput = {
  character: EffectiveCharacter;
  monster: RoMonster;
  skill: RoSkill;
  skillLevel: number;
};

export type SkillFormulaResult = {
  formulaId: string;
  multiplier: number;
  hitCount: number;
};

export type SkillFormulaAdapter = {
  id: string;
  supports(skill: RoSkill): boolean;
  calculate(input: SkillFormulaInput): SkillFormulaResult;
};
