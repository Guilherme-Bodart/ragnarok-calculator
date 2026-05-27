import type { CharacterStatus } from "./character-status-engine";
import type { DamageBreakdownLine } from "./damage-formula-pipeline";
import type { RoMonster, RoSkill } from "./ro-types";

export type CalculationPrecision = "prototype" | "validated" | "server-specific";

export type CalculationMeta = {
  precision: CalculationPrecision;
  note: string;
  warnings: string[];
};

export type DamageRange = {
  minimum: number;
  average: number;
  maximum: number;
  total: number;
};

export type CalculateDamageResult = {
  meta: CalculationMeta;
  characterStatus: CharacterStatus;
  target: RoMonster;
  skill: RoSkill;
  damage: DamageRange;
  breakdown: DamageBreakdownLine[];
};
