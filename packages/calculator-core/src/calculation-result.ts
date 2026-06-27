import type { CharacterStatus } from "./character-status-engine";
import type { DamageBreakdownLine } from "./damage-formula-pipeline";
import type { RoMonster, RoSkill } from "./ro-types";

export type CalculationPrecision = "prototype" | "validated" | "server-specific";

export type CalculationMeta = {
  formulaId: string;
  precision: CalculationPrecision;
  note: string;
  warnings: string[];
};

export type DamageRange = {
  minimum: number;
  average: number;
  maximum: number;
  total: number;
  /** Chance de crítico (0 a 100) */
  criticalChance?: number;
  /** Dano se for um acerto crítico */
  criticalDamage?: number;
  /** Média ponderada entre acerto normal e crítico */
  weightedAverage?: number;
};

export type CalculateDamageResult = {
  meta: CalculationMeta;
  characterStatus: CharacterStatus;
  target: RoMonster;
  skill: RoSkill;
  damage: DamageRange;
  breakdown: DamageBreakdownLine[];
};
