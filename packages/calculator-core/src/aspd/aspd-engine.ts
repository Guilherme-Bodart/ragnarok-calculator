import { getJobBaseAspd } from "./job-aspd";
import type { StatBonus } from "../job-stats";
import type { CalculatorCharacter } from "../ro-types";

export type AspdEngineInput = {
  baseLevel: number;
  classId?: string;
  weaponType: NonNullable<CalculatorCharacter["weaponType"]>;
  effectiveStats: Pick<StatBonus, "agi" | "dex">;
  flatAspd?: number;
  aspdRate?: number;
};

export class AspdEngine {
  calculate(input: AspdEngineInput) {
    const baseAspd = getJobBaseAspd(input.classId, input.weaponType);
    const statBonus =
      Math.sqrt(
        input.effectiveStats.agi ** 2 / 2 + input.effectiveStats.dex ** 2 / 5,
      ) /
      4;
    const speedTotalBonus = 0;
    const positiveEffectBonus =
      (input.effectiveStats.agi + speedTotalBonus) / 200;
    const baseWithStats = baseAspd + statBonus + positiveEffectBonus;
    const rateBonus = (195 - baseWithStats) * ((input.aspdRate ?? 0) / 100);
    const aspd = baseWithStats + rateBonus + (input.flatAspd ?? 0);
    const cap = input.baseLevel <= 99 ? 190 : 193;

    return Math.min(cap, Math.floor(aspd * 100) / 100);
  }
}
