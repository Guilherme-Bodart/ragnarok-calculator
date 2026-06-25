import type { CalculatorModifierEffects } from "./calculator-modifier-effects";
import type { StatBonus } from "./job-stats";
import type { RoSkill } from "./ro-types";

export type CastTimingInput = {
  skill: RoSkill;
  skillLevel: number;
  effectiveStats: Pick<StatBonus, "dex" | "int">;
  modifierEffects: CalculatorModifierEffects;
};

export type CastTimingResult = {
  baseVariableCastMs: number;
  variableCastMs: number;
  baseFixedCastMs: number;
  fixedCastMs: number;
  baseAfterCastDelayMs: number;
  afterCastDelayMs: number;
  cooldownMs: number;
  cycleTimeMs: number;
};

export class CastTimingEngine {
  calculate(input: CastTimingInput): CastTimingResult {
    const skillId = input.skill.id;
    const baseVariableCastMs = getLevelValue(
      input.skill.variableCastMsByLevel,
      input.skillLevel,
    );
    const baseFixedCastMs = getLevelValue(
      input.skill.fixedCastMsByLevel,
      input.skillLevel,
    );
    const baseAfterCastDelayMs = getLevelValue(
      input.skill.afterCastDelayMsByLevel,
      input.skillLevel,
    );
    const cooldownMs = getLevelValue(input.skill.cooldownMsByLevel, input.skillLevel);
    const variableCastRate =
      input.modifierEffects.variableCastRate +
      (input.modifierEffects.skillVariableCastRate[skillId] ?? 0);
    const fixedCastRate = getStrongestFixedCastReductionRate(
      input.modifierEffects.fixedCastRate,
      input.modifierEffects.skillFixedCastRate[skillId] ?? 0,
    );
    const fixedCastFlat =
      input.modifierEffects.fixedCast +
      (input.modifierEffects.skillFixedCast[skillId] ?? 0);
    const variableCastMs = Math.floor(
      baseVariableCastMs *
        getNaturalVariableCastMultiplier(input.effectiveStats) *
        getRateMultiplier(variableCastRate),
    );
    const fixedCastMs = Math.max(
      0,
      Math.floor((baseFixedCastMs + fixedCastFlat) * getRateMultiplier(fixedCastRate)),
    );
    const afterCastDelayMs = applyRate(
      baseAfterCastDelayMs,
      input.modifierEffects.afterCastDelayRate,
    );
    const cycleTimeMs = variableCastMs + fixedCastMs + Math.max(afterCastDelayMs, cooldownMs);

    return {
      baseVariableCastMs,
      variableCastMs,
      baseFixedCastMs,
      fixedCastMs,
      baseAfterCastDelayMs,
      afterCastDelayMs,
      cooldownMs,
      cycleTimeMs,
    };
  }
}

function getLevelValue(values: Record<string, number> | undefined, level: number) {
  return Math.max(0, values?.[String(level)] ?? 0);
}

function applyRate(value: number, rate: number) {
  return Math.max(0, Math.floor(value * (1 + rate / 100)));
}

function getNaturalVariableCastMultiplier(stats: Pick<StatBonus, "dex" | "int">) {
  return Math.max(0, 1 - Math.sqrt((stats.dex * 2 + stats.int) / 530));
}

function getRateMultiplier(rate: number) {
  return Math.max(0, 1 - Math.max(0, -rate) / 100);
}

function getStrongestFixedCastReductionRate(globalRate: number, skillRate: number) {
  return Math.min(0, globalRate, skillRate);
}
